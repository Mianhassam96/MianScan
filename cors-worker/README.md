# MianScan CORS Proxy — Cloudflare Worker

A lightweight, free CORS proxy that powers MianScan's website scanner.

## Why this exists

All free public CORS proxies (corsproxy.io, allorigins, codetabs) are either down,
rate-limited, or require authentication. This worker runs on Cloudflare's free tier:
**100,000 requests/day, zero cost, zero maintenance.**

## Deploy in 3 steps (one-time, ~2 minutes)

### Option A — Cloudflare Dashboard (easiest)

1. Sign up at https://dash.cloudflare.com (free account)
2. Go to **Workers & Pages** → **Create Worker**
3. Click **Edit code**, paste the contents of `worker.js`, click **Deploy**
4. Copy the worker URL (e.g. `https://mianscan-proxy.YOUR-NAME.workers.dev`)
5. Open `js/scanner.js` and update `WORKER_URL`:
   ```js
   WORKER_URL: 'https://mianscan-proxy.YOUR-NAME.workers.dev',
   ```

### Option B — Wrangler CLI

```bash
npm install -g wrangler
wrangler login
cd cors-worker
wrangler deploy
```

## Usage

```
GET https://your-worker.workers.dev/?url=https://target-site.com
```

Returns the proxied HTML with CORS headers set to `*`.

## Limits (Cloudflare free tier)

- 100,000 requests / day
- 10ms CPU time per request
- Global edge network (fast worldwide)

## Security

- Only allows `http://` and `https://` protocols
- Blocks localhost, 127.0.0.1, and internal IP ranges (SSRF protection)
- 3MB response size cap
- 15s upstream timeout
