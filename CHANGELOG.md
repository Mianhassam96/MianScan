# MianScan Changelog

All notable changes to MianScan are documented here.

---

## [v2.4] — 2026-09-13

### Phase 6 — Compare Mode Polish
- Rewrote `_buildOutput()` in `compare.js` from scratch
- New header: Growth Score rings (100px) for both sites with grade badges
- Winner banner shows exact point difference (+N points)
- `_computeWins()` checks 12 signals (Growth Score, SEO, perf, mobile, security, conversion, business, CTA, email, testimonials, HTTPS, tech stack, content depth) — shows up to 5 wins per side
- Category-by-category comparison bars (8 categories) expanding from centre label, winner gets +N badge
- 8 detail sections: SEO, Keywords, CTAs, Tech Stack, Colors, Fonts, Performance, Contacts
- All output XSS-safe via `_e()` helper
- ~250 lines of `cmp6-*` CSS: full responsive (768px, 480px) + light theme

### Phase 5 — MultiMian Lead Funnel
- New "MianScan Found the Problems. We Fix Them." section on landing page
  - 3 service cards: Web Development / SEO & Growth / Conversion Optimisation
  - Featured badge on SEO card, checklist per service
  - Gradient CTA block: "Get a Free Website Growth Review"
- `_mmMicroCTA()` added to `renderBanner()` — shown when critical+high issues exist
  - 3 copy variants driven by critical issue count
  - Links directly to multimian.com
- What's New section updated to v2.4
- Hero badge updated: v2.3 → v2.4
- Footer: new MultiMian services column
- ~150 lines of `mm-*` CSS

### Phase 4 — Professional PDF Report
- Rewrote `toPDF()` in `export.js`
- Page 1 — Cover: dark branded layout, large Growth Score ring, 6-category score grid, summary, MianScan + MultiMian branding
- Page 2 — Findings: up to 12 priority finding cards (priority pill, category, effort, impact) + Action Plan
- Page 3 — Technical: SEO, Performance, Mobile, Security
- Page 4 — Business: Business Readiness (12 signals), Conversion sub-scores, Tech, Contacts
- Page 5 — Intelligence: Domain, Top 18 keywords, Colour swatches grid, Typography
- Final page — MultiMian CTA: dark full-page pitch, score recap strip, 3 service pills, styled button

---

## [v2.3] — 2026-09 (pre-session baseline)

### Phase 3 — Business Audit UX
- Rewrote `tBusiness()`: consultant-style audit with hero, 8-signal quick bar, section cards per domain
- Rewrote `tConversion()`: sub-score progress bars, 18 audit definitions with revenue-impact framing
- Every failing check shows "Why it matters" + "Recommended fix" + impact badge
- MultiMian CTA on both tabs with score-driven copy variants
- ~300 lines of `p3-*` CSS

### Phase 2 — Growth Score Core UX
- Rewrote `tGrowth()` entirely
- New `p2-hero`: 136px score ring, grade letter badge (A–F), domain name, business-language summary
- Category scores: grade badge per category, clickable (navigates to that tab), weak categories highlighted
- Findings: "Why it matters" + "Recommended fix" + impact dot + effort icon per finding
- Action Plan: 3 colour-coded columns (Today / This Week / This Month) with top accent borders
- MultiMian CTA always shown, 4 copy variants driven by score/issue count
- ~250 lines of `p2-*` CSS
- Growth banner strip added to site banner (clickable, shows score + badge pills)

### Phase 1 — Scanner Reliability
- Fixed `_workerReady()`: was comparing URL to itself (always returned false)
- Added `GLOBAL_SCAN_TIMEOUT_MS: 22000` — hard cap via `Promise.race()` across all proxy waves
- Added `Scanner.normalizeUrl()`: lowercase hostname, strip default ports, strip trailing slash on bare origin
- Wired `normalizeUrl()` into all scan entry points (single scan, both compare modes, auto-scan)
- Fixed health check: now tests 0xhorizon + cors.lol in parallel (actual Wave 1 proxies)

---

## [v2.3] — Business + Conversion Analyzers

### Added
- `BusinessAnalyzer` (19 checks): brand identity, services, contact methods, testimonials, client logos, case studies, pricing, FAQ, location, privacy, terms, schema, social
- `ConversionAnalyzer` (18 checks + 5 sub-scores): CTA presence/position/clarity/repetition, lead gen forms, contact accessibility, trust signals, navigation friction
- `GrowthEngine`: 9-category weighted Growth Score (100pts), Priority Findings with effort estimates, Action Plan (Today/This Week/This Month), summary text generation
- Growth tab as default scan result view
- Partial scan results — one analyzer crash no longer kills the full scan (all async analyzers use `Promise.allSettled`)
- Priority Engine: critical → high → medium → low → good findings with effort badges

---

## [v2.2] — Growth Score Introduction

### Added
- Initial Growth Score concept
- Category scoring (SEO, Performance, Mobile, Security, Accessibility, Content, Conversion, UX)
- Priority findings list
- Action plan sections

---

## [v2.1] — Export Suite

### Added
- PDF export (jsPDF)
- JSON export
- CSV export (keywords + contacts)
- CSS color variable export
- Copy report to clipboard
- Share via URL parameter (`?url=`)

---

## [v2.0] — Compare Mode

### Added
- Compare two websites side by side
- Inline compare tab within scanner results
- Standalone compare page (`compare.html`)

---

## [v1.1] — Clean Rebuild

### Added
- CTA Analyzer
- Overview builder
- MultiMian footer branding
- Improved analyzer isolation

---

## [v1.0] — Initial Release

### Added
- Basic website scanner
- SEO analysis (title, meta, headings, links, images)
- Tech stack detection (28+ technologies)
- Color palette extractor
- Font detector
- Contact finder (emails, phones, social)
- Domain authority estimate
- Ranking data
- Mobile friendliness check
- Security grade (A–F)
- Performance metrics
- Keywords extractor
- Indexing / robots checker
- Client-side only — no backend, no signup
