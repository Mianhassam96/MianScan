# MianScan Monitor Worker

Cloudflare Worker that stores scan history in KV so users can track
their website's Growth Score over time — no account required.

## What it does

- Stores up to 30 scan records per domain (180-day TTL)
- Rate limits: max 10 scans per domain per hour
- SSRF protection: blocks private/internal IP addresses
- Anonymous: keyed by domain name, no user accounts needed

## Deploy

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV namespaces

```bash
# Production
wrangler kv:namespace create "SCAN_HISTORY"
wrangler kv:namespace create "RATE_LIMITS"

# Preview (for local dev)
wrangler kv:namespace create "SCAN_HISTORY" --preview
wrangler kv:namespace create "RATE_LIMITS" --preview
```

Copy the IDs into `wrangler.toml`.

### 3. Deploy

```bash
cd monitor-worker
npx wrangler deploy
```

Your worker URL will be:
`https://mianscan-monitor.YOUR-ACCOUNT.workers.dev`

### 4. Wire it up in MianScan

Open `js/scanner.js` and set:

```js
MONITOR_WORKER_URL: 'https://mianscan-monitor.YOUR-ACCOUNT.workers.dev',
```

That's it. Scans will now be saved automatically after each scan.

## API

### POST /scan

Save a scan record.

```json
{
  "domain": "example.com",
  "url": "https://example.com",
  "scannedAt": "2026-09-15T10:00:00.000Z",
  "growthScore": 78,
  "categories": {
    "seo": 82,
    "performance": 71,
    "mobile": 88,
    "security": 91,
    "conversion": 55,
    "business": 60,
    "content": 72,
    "ux": 80,
    "accessibility": 65
  }
}
```

### GET /history?domain=example.com

Returns up to 30 scan records, newest first.

### GET /latest?domain=example.com

Returns the single most recent scan record.

### GET /health

Returns `{ "status": "ok" }`.

## Cloudflare free tier limits

- 100,000 requests/day — more than enough for personal/small-team use
- KV: 1 GB storage, 100,000 reads/day, 1,000 writes/day
- 1 scheduled cron trigger (for future automated monitoring)
