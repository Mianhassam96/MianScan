/**
 * MianScan Monitor Worker — Cloudflare Worker
 *
 * Stores scan history in Cloudflare KV so users can track their
 * website's Growth Score over time without an account.
 *
 * Routes:
 *   POST /scan          — save a scan record
 *   GET  /history       — get scan history for a domain
 *   GET  /latest        — get the most recent scan for a domain
 *   GET  /health        — health check
 *
 * KV bindings required:
 *   SCAN_HISTORY        — scan records (key: history:{domain})
 *   RATE_LIMITS         — rate limit counters (key: rl:{domain}:{YYYYMMDDHH})
 *
 * Deploy:
 *   cd monitor-worker && npx wrangler deploy
 */

const ALLOWED_ORIGINS = [
  'https://mianhassam96.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

const MAX_RECORDS_PER_DOMAIN = 30;
const MAX_POSTS_PER_HOUR     = 10;

// SSRF protection — never fetch or redirect to private addresses
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
const BLOCKED_PREFIXES = ['192.168.', '10.', '172.16.', '172.17.', '172.18.',
  '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
  '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.'];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o => (origin || '').startsWith(o));
  return {
    'Access-Control-Allow-Origin':  allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function isBlockedHost(hostname) {
  const h = (hostname || '').toLowerCase();
  if (BLOCKED_HOSTS.includes(h)) return true;
  if (BLOCKED_PREFIXES.some(p => h.startsWith(p))) return true;
  return false;
}

function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') return false;
  if (domain.length > 253) return false;
  if (isBlockedHost(domain)) return false;
  // Basic hostname validation
  return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(domain);
}

function isValidScore(val) {
  return val === null || val === undefined || (typeof val === 'number' && val >= 0 && val <= 100);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url    = new URL(request.url);
    const path   = url.pathname;
    const domain = (url.searchParams.get('domain') || '').toLowerCase().replace(/^www\./, '');

    try {
      // ── Health check ──────────────────────────────────────────────────────
      if (path === '/health') {
        return json({ status: 'ok', version: '1.0' }, 200, origin);
      }

      // ── POST /scan ────────────────────────────────────────────────────────
      if (request.method === 'POST' && path === '/scan') {
        let body;
        try { body = await request.json(); }
        catch { return json({ error: 'Invalid JSON body' }, 400, origin); }

        const scanDomain = (body.domain || '').toLowerCase().replace(/^www\./, '');

        if (!isValidDomain(scanDomain)) {
          return json({ error: 'Invalid or disallowed domain' }, 400, origin);
        }
        if (!isValidScore(body.growthScore)) {
          return json({ error: 'growthScore must be 0–100' }, 400, origin);
        }

        // Rate limiting — max 10 POSTs per domain per hour
        const now    = new Date();
        const hourKey = `rl:${scanDomain}:${now.toISOString().slice(0, 13).replace('T', '')}`;
        const rlRaw  = await env.RATE_LIMITS.get(hourKey);
        const rlCount = rlRaw ? parseInt(rlRaw, 10) : 0;
        if (rlCount >= MAX_POSTS_PER_HOUR) {
          return json({ error: 'Rate limit exceeded — max 10 scans per hour per domain' }, 429, origin);
        }

        // Build the record
        const record = {
          domain:      scanDomain,
          url:         body.url || '',
          scannedAt:   body.scannedAt || now.toISOString(),
          growthScore: typeof body.growthScore === 'number' ? Math.round(body.growthScore) : null,
          categories: {
            seo:           body.categories?.seo           ?? null,
            performance:   body.categories?.performance   ?? null,
            mobile:        body.categories?.mobile        ?? null,
            security:      body.categories?.security      ?? null,
            conversion:    body.categories?.conversion    ?? null,
            business:      body.categories?.business      ?? null,
            content:       body.categories?.content       ?? null,
            ux:            body.categories?.ux            ?? null,
            accessibility: body.categories?.accessibility ?? null,
          },
        };

        // Load existing history, prepend new record, trim to limit
        const histKey = `history:${scanDomain}`;
        const existing = JSON.parse(await env.SCAN_HISTORY.get(histKey) || '[]');
        const updated  = [record, ...existing].slice(0, MAX_RECORDS_PER_DOMAIN);

        await Promise.all([
          env.SCAN_HISTORY.put(histKey, JSON.stringify(updated), { expirationTtl: 60 * 60 * 24 * 180 }), // 180 days
          env.RATE_LIMITS.put(hourKey, String(rlCount + 1), { expirationTtl: 3600 }),
        ]);

        return json({ success: true, records: updated.length }, 201, origin);
      }

      // ── GET /history ──────────────────────────────────────────────────────
      if (request.method === 'GET' && path === '/history') {
        if (!isValidDomain(domain)) {
          return json({ error: 'Invalid or missing domain parameter' }, 400, origin);
        }
        const records = JSON.parse(await env.SCAN_HISTORY.get(`history:${domain}`) || '[]');
        return json({ domain, records }, 200, origin);
      }

      // ── GET /latest ───────────────────────────────────────────────────────
      if (request.method === 'GET' && path === '/latest') {
        if (!isValidDomain(domain)) {
          return json({ error: 'Invalid or missing domain parameter' }, 400, origin);
        }
        const records = JSON.parse(await env.SCAN_HISTORY.get(`history:${domain}`) || '[]');
        return json({ domain, record: records[0] || null }, 200, origin);
      }

      return json({ error: 'Not found' }, 404, origin);

    } catch (err) {
      return json({ error: 'Internal server error' }, 500, origin);
    }
  },
};
