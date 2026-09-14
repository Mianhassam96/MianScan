# 🔎 MianScan — Website Growth Intelligence

> Scan any website. Get your Growth Score. Know exactly what to fix first.

**MianScan** is a free, client-side website intelligence tool that runs 18+ analyzers in parallel and delivers a prioritised Growth Score with actionable fixes — no signup, no data stored, no backend.

🌐 **Live:** [mianhassam96.github.io/MianScan](https://mianhassam96.github.io/MianScan/)  
🏢 **Built by:** [MultiMian](https://multimian.com/) — Web Development & SEO  
📦 **Current version:** v2.4

---

## What MianScan Does

MianScan doesn't just show you numbers. It tells you **why your website may be losing customers** and what to do about it — in plain English, with effort estimates and business impact ratings.

```
Enter URL
   ↓
18 Analyzers run in parallel
   ↓
Growth Score (0–100)
   ↓
Priority Findings (Critical → High → Medium)
   ↓
Action Plan (Today / This Week / This Month)
   ↓
MultiMian CTA (if issues found)
```

---

## Growth Score

The core output of every scan. A single 0–100 score across 9 weighted categories:

| Category         | Weight | What it measures |
|---|---|---|
| SEO              | 18%    | Title, meta, headings, alt text, canonical, OG tags |
| Performance      | 13%    | Page size, scripts, lazy loading, Core Web Vitals |
| Mobile           | 11%    | Viewport, responsive images, media queries, PWA |
| Security         | 10%    | HTTPS, CSP, referrer policy, mixed content |
| Conversion       | 12%    | CTAs, contact forms, lead capture, trust signals |
| Business         | 10%    | Testimonials, pricing, privacy, schema, contact info |
| Content          | 9%     | Word count, readability, keyword density |
| Accessibility    | 8%     | Alt text, labels, contrast, ARIA |
| UX               | 9%     | Navigation, footer, hero, internal links |

---

## 18+ Analyzers

| Analyzer | What it finds |
|---|---|
| **SEO Score** | Title, meta description, H1–H3 hierarchy, alt text, canonical, OG/Twitter tags |
| **Growth Score** | Weighted overall score + 9 category scores + Priority Findings |
| **Business Readiness** | Brand identity, contact methods, testimonials, pricing, legal pages, schema |
| **Conversion Intelligence** | CTAs, lead gen forms, contact signals, trust evidence, navigation friction |
| **Security Grade** | HTTPS, CSP header, referrer policy, mixed content, unsafe forms (A–F) |
| **Mobile Friendliness** | Viewport, responsive images, media queries, tap targets, PWA manifest |
| **Performance** | HTML size, script/style counts, lazy loading, inline JS, accessibility checks |
| **Tech Stack** | 28+ frameworks, CMS, CDN, analytics, payment tools |
| **Color Palette** | All HEX/RGB colors with CSS export |
| **Font Detector** | Heading/body/button fonts with weights and Google Fonts links |
| **CTA Analyzer** | Primary/secondary CTAs, button text, anchor links |
| **Contact Finder** | Emails, phones, WhatsApp, social profiles |
| **Keywords & Topics** | Top keywords with density, bigrams, trigrams, content topics |
| **Headings Structure** | H1/H2/H3 counts and hierarchy |
| **Links Analyzer** | Internal/external links, follow/nofollow |
| **Images SEO** | Total, missing alt text, lazy loading, modern formats |
| **Domain & Ranking** | DA estimate, global rank, country |
| **Indexing & Robots** | robots.txt, noindex/nofollow, sitemap, schema types, hreflang |
| **Compare Mode** | Side-by-side Growth Score, category bars, advantage summary |

---

## Priority Findings

Every scan produces a ranked list of findings:

```
🔴 Fix Today (Critical)
   Missing page title
   Impact: High  ·  Effort: Easy (< 15 min)
   Why: Search engines use the title as the primary ranking signal...
   Fix: Add a <title> tag of 50–60 characters to your <head>.

🟠 Fix This Week (High)
   14 images missing alt text
   Impact: High  ·  Effort: Easy (< 30 min)

🟡 Improve Next (Medium)
   No Organization schema markup
   Impact: Medium  ·  Effort: Easy (< 1 hr)

✅ Passing
   HTTPS enabled
   Viewport correctly configured
```

---

## Compare Mode

Scan two websites side by side:

- Growth Score rings for both sites
- Winner banner with point difference
- "Where X wins" — 12-signal advantage detector
- Category-by-category comparison bars
- Detailed SEO, keywords, CTAs, tech, colors, contacts

---

## Professional PDF Export

5-page client-ready report:

| Page | Content |
|---|---|
| 1 — Cover | Growth Score ring, 6-category grid, summary, branding |
| 2 — Findings | Priority findings cards + Action Plan |
| 3 — Technical | SEO, Performance, Mobile, Security |
| 4 — Business | Business Readiness, Conversion, Tech, Contacts |
| 5 — Intelligence | Domain, Keywords, Color swatches, Fonts |
| Final — CTA | MultiMian services pitch |

---

## How It Works

1. Enter any public URL
2. MianScan fetches the page through a CORS proxy (Cloudflare Worker)
3. 18 analyzers run client-side in parallel
4. Results are aggregated into a Growth Score
5. Priority findings and action plan are generated
6. View, export, or share the report

**No server. No database. No account required.**  
Results are cached in `localStorage` for 30 minutes (max 5 URLs).

---

## Tech Stack

- Vanilla JavaScript (ES2020+)
- DOMParser for HTML analysis
- Cloudflare Worker for CORS proxy
- jsPDF for PDF generation
- Bootstrap Icons
- Google Fonts (Inter, Space Grotesk)
- GitHub Pages for hosting
- GitHub Actions for CI/CD

---

## Architecture

```
index.html
├── js/
│   ├── app.js          — scan orchestration, URL handling, UI wiring
│   ├── scanner.js      — fetch pipeline, proxy waves, cache, normalizeUrl
│   ├── growth.js       — GrowthEngine: scores, findings, action plan
│   ├── ui.js           — all tab rendering (tGrowth, tBusiness, tConversion…)
│   ├── compare.js      — Compare Mode engine and output
│   ├── export.js       — PDF, JSON, CSV, CSS, clipboard exports
│   ├── tools.js        — standalone tools page
│   └── analyzers/
│       ├── seo.js
│       ├── performance.js
│       ├── mobile.js
│       ├── security.js
│       ├── tech.js
│       ├── colors.js
│       ├── fonts.js
│       ├── cta.js
│       ├── content.js
│       ├── structure.js
│       ├── links.js
│       ├── images.js
│       ├── contacts.js
│       ├── media.js
│       ├── domain.js
│       ├── ranking.js
│       ├── indexing.js
│       ├── conversion.js
│       └── business.js
├── css/
│   ├── style.css       — core design system + all component CSS
│   ├── landing.css     — landing page sections
│   └── responsive.css  — breakpoints
└── cors-worker/
    └── worker.js       — Cloudflare Worker CORS proxy
```

---

## Scanner Reliability

The fetch pipeline uses 3 waves of CORS proxies:

```
Wave 1 (parallel, fastest):
  CF Worker + 0xhorizon + cors.lol

Wave 2 (parallel fallback):
  allorigins + codetabs

Wave 3 (sequential last resort):
  allorigins-raw + corsproxy.io
```

**Hard 22-second global timeout** via `Promise.race()` — users never wait more than 22s before seeing a clear error message.

Each analyzer is wrapped in a `safe()` call — one crash never kills the full scan.

---

## Use Cases

| Audience | Use Case |
|---|---|
| **Business Owners** | Understand why your website isn't generating leads |
| **SEO Experts** | Full technical + content audit in seconds |
| **Agencies** | Client reporting, competitor analysis, proposal material |
| **Freelancers** | Gather client data, find contact info, pitch improvements |
| **Developers** | Tech stack detection, performance audit, accessibility check |
| **Designers** | Color palette + font extraction |

---

## Privacy

- No data is sent to any server (scans run client-side)
- Scanned URLs are cached in `localStorage` only (30min TTL, 5 URL max)
- No analytics, no tracking, no account required
- The CORS proxy only relays the HTTP response — nothing is logged or stored

---

## Roadmap

```
✅ Phase 1  Scanner Reliability (global timeout, URL normalisation, proxy fix)
✅ Phase 2  Growth Score UX (hero ring, category grades, findings redesign)
✅ Phase 3  Business Audit (consultant-style Why/Fix/Impact per check)
✅ Phase 4  Professional PDF Report (5-page client-ready export)
✅ Phase 5  MultiMian Lead Funnel (landing section, inline micro-CTAs)
✅ Phase 6  Compare Mode Polish (Growth Score header, advantage summary)

🔜 Phase 7  Saved Reports + Google Login + Dashboard
🔜 Phase 8  Competitor Intelligence
🔜 Phase 9  Website Monitoring
🔜 Phase 10 MianScan → MultiMian Lead Engine
```

---

## Deploying the CORS Worker

For best reliability, deploy the included Cloudflare Worker:

```bash
cd cors-worker
npx wrangler deploy
```

Then update `WORKER_URL` in `js/scanner.js`:

```js
WORKER_URL: 'https://your-worker.your-account.workers.dev',
```

The worker is free up to 100,000 requests/day on Cloudflare's free tier.

---

## Contributing

Issues and PRs welcome. The codebase is intentionally kept as vanilla JS — no build step, no bundler, no framework.

To run locally: just open `index.html` in a browser (or use Live Server).

---

## Brand

Built with ❤️ by [MultiMian](https://multimian.com/) — Professional Web Development & SEO

> MianScan finds what's holding your website back.  
> MultiMian fixes it.
