# MianScan CORS Proxy — Cloudflare Worker

A lightweight CORS proxy that powers MianScan's website scanner.
Free forever on Cloudflare's free tier (100,000 requests/day).

---

## Deploy via Dashboard (easiest, no CLI needed)

1. Go to **https://dash.cloudflare.com** — sign up free, no credit card
2. Click **Workers & Pages** → **Create Worker**
3. Click **Edit code** — delete the placeholder code
4. Paste the full contents of **`worker.js`** (this folder)
5. Click **Deploy**
6. Copy your worker URL, e.g.:
   `https://mianscan-proxy.YOUR-SUBDOMAIN.workers.dev`
7. Open `js/scanner.js`, find `WORKER_URL` and replace the value:
   ```js
   WORKER_URL: 'https://mianscan-proxy.YOUR-SUBDOMAIN.workers.dev',
   ```
8. Commit and push — scans will work immediately

---

## Deploy via CLI

```bash
# Install wrangler (Cloudflare CLI)
npm install -g wrangler

# Login to your Cloudflare account
wrangler login

# Deploy from this directory
cd cors-worker
wrangler deploy
```

The worker will be live at:
`https://mianscan-proxy.YOUR-SUBDOMAIN.workers.dev`

---

## Test your deployment

Open this URL in a browser — you should see the HTML of example.com:

```
https://mianscan-proxy.YOUR-SUBDOMAIN.workers.dev/?url=https://example.com
```

---

## What the worker does

- Accepts `GET /?url=https://target.com`
- Fetches the target URL from Cloudflare's edge (bypasses CORS)
- Returns the response with `Access-Control-Allow-Origin: *`
- Blocks private/internal IPs (SSRF protection)
- Caps response size at 3MB
- 15 second upstream timeout
- Returns proper error JSON on failure

---

## Cloudflare free tier limits

| Limit | Value |
|---|---|
| Requests per day | 100,000 |
| CPU time per request | 10ms |
| Memory | 128MB |
| Cost | $0 |
