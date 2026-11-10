# MianScan Changelog

All notable changes to MianScan are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-09-15

### First stable release — Website Growth Intelligence

MianScan v1.0 is the first production-ready release. It covers all core
website analysis capabilities, a full Growth Score engine, professional
PDF export, Compare Mode, and the MultiMian lead funnel.

---

### Scanner & Architecture

- **19 independent analyzer modules** running in parallel (up from 16 at v0.1)
- **Multi-proxy fetch pipeline** — 3-wave fallback (CF Worker → 0xhorizon →
  cors.lol → allorigins → codetabs → corsproxy.io)
- **22-second global timeout** via `Promise.race()` — eliminates 60s+ waits
- **`normalizeUrl()`** — consistent cache keys across URL variants
- **`safe()` wrapper** — one analyzer crash never kills the full scan
- **Partial scan indicator** — user sees which analyzers returned fallback data
- **`_workerReady()`** fixed — Cloudflare Worker now participates in Wave 1
- **Wave 3 error accumulation** — accurate error code surfacing

### Analyzer Accuracy Fixes

**conversion.js**
- Expanded `ctaKeywords` to 20+ phrases including Urdu CTAs for
  international sites
- Phone false positive fix — requires structural pattern + contextual signal
- Email false positive fix — excludes framework package names (`react@`, etc.)
- Contact form detection — field-structure based, not class-name based
- Newsletter/contact form double-counting eliminated

**business.js**
- Same phone and email false positive fixes applied

**security.js**
- Mixed content: DOM-based check instead of raw HTML regex (no more
  false positives from HTML comments)
- Referrer policy: DOM-only check (no regex against fullHtml)
- `hasOpenRedirect` surfaced in checks (was dead code)

**performance.js**
- Label check: excludes submit/button/reset/image inputs; respects
  `aria-label`, `aria-labelledby`, implicit labels
- External scripts: uses `getAttribute('src')` not `.src` (resolved URL)
  — relative scripts no longer appear external

**content.js**
- Word count: clones body, removes `<script>/<style>/<noscript>` before
  counting — eliminates JS/CSS inflation of content scores

**seo.js**
- Meta keywords: removed 5-pt award (obsolete/harmful signal); now shows
  as `warn` when present, `ok` when absent
- SEO score ceiling restored to 100 (redistributed 5pts to H2 check)

**cta.js**
- Primary/secondary pattern expanded; class-based fallback covers more
  framework conventions

**structure.js**
- All selectors tightened with `:not()` to exclude child/item elements —
  navbar overcounting eliminated

**links.js**
- Protocol-relative URLs (`//cdn.example.com`) correctly classified as
  external (not internal)

**contacts.js**
- Same email/phone false positive fixes applied

**tech.js**
- Tailwind CSS: replaced class-attribute regex (caused false positives on
  Bootstrap/vanilla CSS) with file/CDN/package reference detection only

**ranking.js**
- OPR `status_code === 200` guard before using data
- Tranco: direct CORS fetch before proxy fallback
- PageSpeed timeout: 20s → 15s

**indexing.js**
- robots.txt: 3-proxy waterfall (corsproxy.io → allorigins → cors.lol)

**domain.js**
- OPR `status_code === 200` guard applied

---

### Growth Score Engine

- 9 weighted categories (SEO 18%, Performance 13%, Mobile 11%, Security 10%,
  Conversion 12%, Business 10%, Content 9%, UX 9%, Accessibility 8%)
- **Priority findings** with Why it matters / Recommended fix / Impact / Effort
- **Action Plan** — Today / This Week / This Month
- **`_buildSummary()`** reordered to `else-if` — critical issues never hidden
  on high-scoring sites
- Accessibility default changed 60 → 40 (no data = not a pass)
- CTA crowded check: uses `conversion.ctaCrowded` not raw `cta.all.length`
- Trust score: uses `trustSectionScore` (0–100) not `trustScore` (0–20 raw)

---

### UI/UX

**Brand system**
- MultiMian blue design system: `--primary: #2563eb`, `--primary2: #60a5fa`
- All purple/cyan accent colors replaced with blue family throughout
- Gradients: blue-to-dark-blue (no purple, no cyan)
- theme-color meta tag updated to `#2563eb`

**Component polish**
- Button heights standardised; `focus-visible` keyboard outlines on all
  interactive elements
- Card hover: subtle blue shadow
- Tab active indicator: clean blue underline
- Error state: `.scan-error-state` CSS classes (was 100% inline styles)
- Partial scan notice: yellow strip with affected analyzer names
- Cancel button added to scan overlay
- Tab bar edge fade masks for horizontal scroll affordance
- `.ilbl` responsive fix on 320px/375px screens
- `.exp-btn` min-height 44px on mobile (touch targets)

**Growth Score tab**
- 136px score ring with grade letter badge (A–F)
- Category cards: clickable → opens that analyzer tab, weak categories
  highlighted, grade badge per category
- Findings: "Why it matters" + "Recommended fix" + impact dot + effort icon
- Action Plan: 3 colour-coded columns
- MultiMian CTA: always shown, 4 copy variants driven by scan result

**Business & Conversion tabs**
- Consultant-style audit reports
- Every failing check shows Why it matters + Recommended fix + impact badge
- Sub-score progress bars in Conversion tab
- MultiMian CTA with score-driven copy

**Compare Mode**
- Growth Score rings (100px) for both sites
- Winner banner with point difference
- 12-signal advantage detector
- Side-by-side category comparison bars
- 8 detail sections

**Loading / Error UX**
- Progress messages during async external data phase (57%→65%→73%→81%)
- Duplicate skeleton CSS removed
- 22-second global timeout prevents 60s+ freezes

---

### PDF Report

5-page client-ready report:
- Page 1: Cover with Growth Score ring, 6-category grid, summary
- Page 2: Priority findings + Action Plan
- Page 3: SEO, Performance, Mobile, Security
- Page 4: Business Readiness, Conversion, Tech, Contacts
- Page 5: Domain, Keywords, Colour swatches, Typography
- Final: MultiMian CTA with score recap

---

### Landing Page & Content

- Hero: "Understand your website. Improve its growth."
- Features section: outcome-focused headlines (Growth Score first,
  "Why visitors aren't converting", Business Readiness Audit)
- How It Works: "From URL to Action Plan in Under 10 Seconds"
- Compare section: yoursite.com vs competitor.com with business-relevant metrics
- Who It's For: Business Owners first, outcome-focused copy
- Why It Works section (replaced "Open Source / Built in Public")
- What's New: product milestones (not developer changelog)
- Final CTA: "What's Your Website's Growth Score?"
- MultiMian lead section with 3 service cards + gradient CTA block
- Inline micro-CTA in scan banner (fires on critical/high issues)

### Inner Pages

- All pages: footer tagline updated to "Free website growth analyzer"
- features.html: hero updated, icon colors fixed, "19 Analyzers" pill
- how-it-works.html: all sections updated, Growth Score tab added to grid
- All pages: OG tags, Twitter cards, favicon, robots, theme-color added

### SEO & Metadata

- All page titles updated: "Free Website Growth Analyzer"
- Descriptions updated with Growth Score value proposition
- Keywords refreshed: growth score, conversion analysis, business readiness
- sitemap.xml: lastmod dates added to all 5 URLs
- 404.html: purple/cyan replaced with blue

---

### Security

- `copyBtn()`: uses `data-val` attribute instead of inline `onclick` string
  (XSS from emails, links, tech names)
- Color hex in onclick: validated with regex + `data-hex` attribute
- Keywords/tags: use `data-kw`/`data-tag` attributes
- Retry button: uses `data-retry-url` attribute
- OG image src: properly escaped
- renderStats/tOverview: optional chaining on all fallback object accesses
- Palette strip: hex validated before use

---

## [0.9.0] — 2026-09 (pre-release)

### Added
- Growth Score engine with 9 categories and weighted scoring
- Business Readiness analyzer (19 checks)
- Conversion Intelligence analyzer (18 checks + 5 sub-scores)
- Priority findings with effort estimates and action plan
- Professional PDF export (jsPDF, 5 pages)
- Compare Mode (Growth Score header, advantage summary, category bars)
- MultiMian lead funnel (landing section, micro-CTAs)

---

## [0.5.0] — 2026-08

### Added
- Compare Mode (side-by-side website comparison)
- Inline compare tab within scanner results
- JSON, CSV, CSS export
- Growth Score (initial implementation)
- Cloudflare Worker for CORS proxy

---

## [0.3.0] — 2026-07

### Added
- 16 analyzer modules (SEO, tech stack, colors, fonts, contacts, links,
  images, performance, security, mobile, media, structure, content, CTA,
  domain, ranking, indexing)
- Multi-wave CORS proxy fallback
- LocalStorage cache (30 min TTL, 5 URL max)
- Share via URL parameter (`?url=`)
- Dark/light theme toggle

---

## [0.1.0] — 2026-06

### Initial release
- Basic website scanner
- SEO analysis
- Tech stack detection
- Color palette extractor
- Font detector
- Contact finder
- Domain authority estimate
- Client-side only — no backend, no signup required
