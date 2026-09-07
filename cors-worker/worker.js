/**
 * MianScan CORS Proxy — Cloudflare Worker
 * Compatible with: Cloudflare Workers (ES Modules format)
 *
 * Deploy steps:
 *   Dashboard: dash.cloudflare.com → Workers & Pages → Create Worker
 *              → Edit code → paste this file → Deploy
 *
 *   CLI: cd cors-worker && npx wrangler deploy
 *
 * After deploy, update WORKER_URL in js/scanner.js with your worker URL.
 */

const MAX_RESPONSE_SIZE = 3 * 1024 * 1024; // 3 MB

// SSRF protection — never proxy to private/internal addresses
const BLOCKED = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
];
const BLOCKED_PREFIXES = ['192.168.', '10.', '172.16.', '172.17.', '172.18.',
  '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
  '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.'];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
  });
}

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  if (BLOCKED.includes(h)) return true;
  if (BLOCKED_PREFIXES.some(p => h.startsWith(p))) return true;
  return false;
}

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Only GET / HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError('Only GET and HEAD are supported', 405);
    }

    // Parse ?url=
    const { searchParams } = new URL(request.url);
    const rawTarget = searchParams.get('url');
    if (!rawTarget) return jsonError('Missing ?url= parameter', 400);

    // Validate target URL
    let target;
    try {
      target = new URL(rawTarget);
    } catch {
      return jsonError('Invalid target URL', 400);
    }

    if (!['http:', 'https:'].includes(target.protocol)) {
      return jsonError('Only http and https protocols are allowed', 400);
    }

    if (isBlockedHost(target.hostname)) {
      return jsonError('Target host is not allowed', 403);
    }

    // Fetch the target — AbortSignal.timeout() is natively supported in CF Workers
    let upstream;
    try {
      upstream = await fetch(target.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      });
    } catch (err) {
      const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
      return jsonError(timedOut ? 'Upstream request timed out' : `Fetch failed: ${err.message}`, timedOut ? 504 : 502);
    }

    // Stream body up to MAX_RESPONSE_SIZE
    const chunks = [];
    let received = 0;

    try {
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        chunks.push(value);
        if (received >= MAX_RESPONSE_SIZE) break;
      }
    } catch {
      // Partial read is fine — return what we have
    }

    // Reassemble
    const output = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';

    return new Response(output, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'X-Proxied-By': 'MianScan-Worker',
        'X-Original-Status': String(upstream.status),
        ...corsHeaders(),
      },
    });
  },
};
