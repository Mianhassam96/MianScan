/**
 * MianScan CORS Proxy — Cloudflare Worker
 *
 * Deploy once, free forever (100k req/day on CF free tier).
 *
 * Usage:
 *   https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/?url=https://target.com
 *
 * Deploy steps (one-time):
 *   1. Sign up at https://dash.cloudflare.com (free)
 *   2. Go to Workers & Pages → Create Worker
 *   3. Paste this file content into the editor
 *   4. Click Deploy
 *   5. Copy the worker URL and update PROXY_URL in scanner.js
 */

const ALLOWED_METHODS = ['GET', 'HEAD'];
const MAX_RESPONSE_SIZE = 3 * 1024 * 1024; // 3MB
const TIMEOUT_MS = 15000;

// Basic SSRF protection — block private/internal addresses
const BLOCKED_HOSTS = [
  'localhost', '127.0.0.1', '0.0.0.0', '::1',
  '169.254.169.254',  // AWS metadata
  '192.168.', '10.', '172.16.',
];

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
        status: 204,
      });
    }

    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    const reqUrl = new URL(request.url);
    const target = reqUrl.searchParams.get('url');

    if (!target) {
      return new Response(
        JSON.stringify({ error: 'Missing ?url= parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Only http/https allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    // Block private/internal addresses
    const host = targetUrl.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some(b => host === b || host.startsWith(b))) {
      return new Response(
        JSON.stringify({ error: 'Blocked host' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }
      );
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const upstream = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MianScan/2.2; +https://mianhassam96.github.io/MianScan/)',
          'Accept': 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        redirect: 'follow',
        cf: { cacheTtl: 0 },
      });

      clearTimeout(timer);

      // Read body up to size limit
      const reader = upstream.body?.getReader();
      if (!reader) {
        return new Response('', { status: 200, headers: corsHeaders() });
      }

      const chunks = [];
      let totalSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalSize += value.length;
        if (totalSize > MAX_RESPONSE_SIZE) break; // truncate, still return what we have
        chunks.push(value);
      }

      const body = new Uint8Array(totalSize > MAX_RESPONSE_SIZE ? MAX_RESPONSE_SIZE : totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.length;
      }

      const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';

      return new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': contentType,
          'X-Proxied-By': 'MianScan-Worker',
          'X-Original-Status': String(upstream.status),
          ...corsHeaders(),
        },
      });

    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      return new Response(
        JSON.stringify({ error: isTimeout ? 'Upstream timeout' : err.message }),
        {
          status: isTimeout ? 504 : 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        }
      );
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  };
}
