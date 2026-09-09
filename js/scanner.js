const Scanner = {
  currentData: null,

  // ── Cache config
  CACHE_KEY:  'ms_cache',
  CACHE_TTL:  30 * 60 * 1000, // 30 minutes
  CACHE_MAX:  5,               // max cached URLs

  // ── Save scan result to localStorage
  _cacheSave(url, data) {
    try {
      const store = this._cacheLoad() || {};
      store[url] = { data, ts: Date.now() };
      // Evict oldest if over limit
      const keys = Object.keys(store);
      if (keys.length > this.CACHE_MAX) {
        const oldest = keys.sort((a,b) => store[a].ts - store[b].ts)[0];
        delete store[oldest];
      }
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(store));
    } catch (_) {}
  },

  // ── Get all cached entries
  _cacheLoad() {
    try { return JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}'); } catch { return {}; }
  },

  // ── Get cached result for a URL (null if expired/missing)
  cacheGet(url) {
    const store = this._cacheLoad();
    const entry = store[url];
    if (!entry) return null;
    if (Date.now() - entry.ts > this.CACHE_TTL) return null;
    return entry.data;
  },

  // ── Clear all cache
  cacheClear() {
    localStorage.removeItem(this.CACHE_KEY);
  },

  // ── Fetch configuration ───────────────────────────────────────────────────
  //
  // All public CORS proxies are unreliable — they go down, rate-limit, or
  // require API keys without notice. The ONLY permanent fix is deploying
  // the Cloudflare Worker in cors-worker/worker.js (free, 100k req/day).
  //
  // Until the Worker is deployed, the scanner uses a wide proxy pool and
  // tries all of them. If every proxy is down simultaneously, scans fail.
  //
  // To fix permanently:
  //   1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
  //   2. Paste cors-worker/worker.js → Deploy
  //   3. Set WORKER_URL below to your deployed URL

  WORKER_URL: 'https://mianscan-proxy.multimian.workers.dev',
  FETCH_TIMEOUT_MS: 15000,

  ERR_TIMEOUT: 'ERR_TIMEOUT',
  ERR_BLOCKED: 'ERR_BLOCKED',
  ERR_EMPTY:   'ERR_EMPTY',
  ERR_SCANNER: 'ERR_SCANNER',

  _workerReady() {
    return this.WORKER_URL !== 'https://mianscan-proxy.multimian.workers.dev';
  },

  async fetchHTML(url) {
    const errors = [];

    const tryProxy = async (label, proxyUrl, jsonKey, ms) => {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(timer);

        // 429 = rate limited (proxy issue, not site blocking)
        // 401/403 = auth required (could be proxy or site)
        // 5xx = proxy/server error
        if (!res.ok) {
          const isProxyErr = res.status === 429 || res.status >= 500;
          const code = isProxyErr ? this.ERR_SCANNER : this.ERR_BLOCKED;
          throw Object.assign(new Error(`HTTP ${res.status}`), { code });
        }

        const raw = await res.text();

        // Unwrap allorigins/similar JSON envelope
        if (jsonKey) {
          try {
            const j = JSON.parse(raw);
            if (j[jsonKey] && j[jsonKey].length > 200) return j[jsonKey];
          } catch (_) {}
        }
        // Generic JSON unwrap
        try {
          const j = JSON.parse(raw);
          if (j.contents && j.contents.length > 200) return j.contents;
        } catch (_) {}

        if (raw.length > 200) return raw;
        throw Object.assign(new Error('Empty response'), { code: this.ERR_EMPTY });

      } catch (e) {
        clearTimeout(timer);
        errors.push(`${label} → ${e.message}`);
        const code = e.name === 'AbortError' ? this.ERR_TIMEOUT : (e.code || this.ERR_SCANNER);
        throw Object.assign(e, { code });
      }
    };

    // ── Wave 1: race CF Worker + 0xhorizon + cors.lol simultaneously (fastest)
    const wave1 = [];
    if (this._workerReady()) {
      wave1.push(tryProxy('worker',    `${this.WORKER_URL}/?url=${encodeURIComponent(url)}`,           null, 12000));
    }
    wave1.push(  tryProxy('0xhorizon', `https://cors-anywhere.0xhorizon.workers.dev/${url}`,           null, 12000));
    wave1.push(  tryProxy('cors.lol',  `https://api.cors.lol/?url=${encodeURIComponent(url)}`,         null, 10000));

    try { return await Promise.any(wave1); } catch (_) {}

    // ── Wave 2: race allorigins + codetabs simultaneously
    try {
      return await Promise.any([
        tryProxy('allorigins', `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, 'contents', 12000),
        tryProxy('codetabs',   `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, null,  10000),
      ]);
    } catch (_) {}

    // ── Wave 3: sequential last-resort proxies
    const wave3 = [
      ['allorigins2', `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,  null, 10000],
      ['corsproxy',   `https://corsproxy.io/?url=${encodeURIComponent(url)}`,           null, 10000],
    ];
    for (const [label, pUrl, jKey, ms] of wave3) {
      try { return await tryProxy(label, pUrl, jKey, ms); } catch (_) {}
    }

    // ── All waves failed — determine the most meaningful error to show
    const allBlocked = errors.every(e => /401|403/.test(e));
    const anyTimeout = errors.some(e => /timeout|abort/i.test(e));
    const allEmpty   = errors.every(e => /empty/i.test(e));

    // If EVERY proxy returned a non-auth error, it's a proxy infrastructure
    // problem — not the target site blocking us. Show ERR_SCANNER.
    const code = anyTimeout  ? this.ERR_TIMEOUT
               : allEmpty    ? this.ERR_EMPTY
               : allBlocked  ? this.ERR_BLOCKED  // only if ALL proxies got 401/403
                             : this.ERR_SCANNER; // most common: proxies down/rate-limited

    throw Object.assign(new Error(code), { code, details: errors.join(' | ') });
  },

  parse(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  },

  _extractDesc(doc) {
    const selectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ];
    for (const sel of selectors) {
      const val = doc.querySelector(sel)?.getAttribute('content')?.trim();
      if (val && val.length > 5) return val;
    }
    const paras = [...doc.querySelectorAll('p')];
    for (const p of paras) {
      const t = p.textContent?.trim();
      if (t && t.length > 40 && t.length < 300) return t;
    }
    return '';
  },

  _overview(doc, url, structure, content, desc) {
    const title = doc.querySelector('title')?.textContent?.trim() || new URL(url).hostname;
    const lang  = (doc.documentElement.getAttribute('lang') || 'en').split('-')[0].toUpperCase();
    const body  = (doc.body?.innerHTML || '').toLowerCase();
    let type = 'Website';
    if (/pricing|saas|dashboard|free trial|subscribe/i.test(body))  type = 'SaaS / Product';
    else if (/shop|cart|checkout|add to cart|buy now/i.test(body))  type = 'E-commerce';
    else if (/portfolio|my work|case stud/i.test(body))             type = 'Portfolio';
    else if (/\bblog\b|article|\bpost\b|category/i.test(body))      type = 'Blog / Media';
    else if (/agency|services|we help|our team/i.test(body))        type = 'Agency / Services';
    else if (/\bdocs\b|documentation|api reference/i.test(body))    type = 'Documentation';
    return {
      title, desc, lang, type,
      sections: structure.tree.length,
      topic: content.topics[0] || content.keywords[0]?.word || '—'
    };
  },

  async scan(url, onProgress) {
    const p = (msg, pct) => onProgress && onProgress(msg, pct);

    p('Connecting to website…', 5);
    const html = await this.fetchHTML(url);
    p('Parsing HTML…', 12);
    const doc = this.parse(html);

    // ── Synchronous analyzers — wrapped individually so one crash
    //    doesn't kill the entire scan (partial results)
    const safe = (fn, fallback) => { try { return fn(); } catch(_) { return fallback; } };

    p('Analyzing SEO…', 18);
    const seo         = safe(() => SEOAnalyzer.analyze(doc),               { score:0, h1s:[], h2s:[], h3s:[], checks:[], warnings:[], noAlt:0, withAlt:0, imagesTotal:0 });
    p('Analyzing content…', 22);
    const content     = safe(() => ContentAnalyzer.analyze(doc),           { keywords:[], topics:[], tags:[], wordCount:0, paragraphCount:0, bigrams:[], trigrams:[], readability:{score:50,label:'N/A',grade:'N/A'} });
    p('Analyzing structure…', 26);
    const structure   = safe(() => StructureAnalyzer.analyze(doc),         { counts:{}, tree:[], components:[], totalElements:0 });
    p('Detecting tech stack…', 30);
    const tech        = safe(() => TechAnalyzer.analyze(doc, html),        { detected:[], scriptsCount:0, scriptSrcs:[] });
    p('Analyzing performance…', 34);
    const performance = safe(() => PerformanceAnalyzer.analyze(doc, html), { score:50, grade:'C', htmlSizeKB:'0', scriptsCount:0, stylesCount:0, imagesCount:0, iframesCount:0, inlineKB:'0', lazyImgs:0, extScripts:0, checks:[], a11y:[] });
    p('Checking mobile…', 38);
    const mobile      = safe(() => MobileAnalyzer.analyze(doc, html),      { score:50, grade:'C', hasViewport:false, hasWidthDevice:false, hasManifest:false, hasMediaQueries:false, hasResponsiveImgs:false, lazyImgs:0, checks:[] });
    p('Extracting colors…', 42);
    const colors      = safe(() => ColorAnalyzer.analyze(doc, html),       { colors:[], total:0 });
    p('Detecting fonts…', 44);
    const fonts       = safe(() => FontAnalyzer.analyze(doc, html),        { fonts:[], total:0 });
    p('Analyzing CTAs…', 46);
    const cta         = safe(() => CTAAnalyzer.analyze(doc),               { primary:[], secondary:[], all:[] });
    p('Scanning media…', 48);
    const media       = safe(() => MediaAnalyzer.analyze(doc, url),        { images:[], videos:[], totalImages:0, totalVideos:0 });
    p('Analyzing links…', 50);
    const links       = safe(() => LinksAnalyzer.analyze(doc, url),        { internal:[], external:[], cta:[], totalInternal:0, totalExternal:0 });
    p('Scanning images…', 52);
    const images      = safe(() => ImagesAnalyzer.analyze(doc, url),       { images:[], total:0, withAlt:0, missingAlt:[], missingAltCount:0, lazyCount:0, modernFmt:0, issues:[] });
    p('Finding contacts…', 54);
    const contacts    = safe(() => ContactAnalyzer.analyze(doc, html),     { emails:[], phones:[], whatsapp:[], addresses:[], contactPage:'', social:{} });

    p('Fetching external data…', 57);

    // External/async analyzers — allSettled so none blocks others
    const [indexing, domain, ranking, security] = await Promise.allSettled([
      IndexingAnalyzer.analyze(doc, html, url),
      DomainAnalyzer.analyze(url),
      RankingAnalyzer.analyze(url),
      SecurityAnalyzer.analyze(url, doc, html),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

    p('Analyzing conversion…', 90);
    const conversion = safe(() => ConversionAnalyzer.analyze(doc, html),   { score:40, grade:'D', checks:[], trustScore:0, contactScore:0, hasPrimaryCTA:false, ctaAboveFold:false, ctaCrowded:false, hasTestimonials:false, hasSocialProof:false, hasPricing:false, hasForm:false, hasNewsletterForm:false, hasLeadCapture:false, hasExcessiveNav:false, navCount:0 });

    p('Analyzing business readiness…', 92);
    const business   = safe(() => BusinessAnalyzer.analyze(doc, html),     { score:40, grade:'D', checks:[], hasEmail:false, hasPhone:false, hasTestimonials:false, hasClientLogos:false, hasSocialProof:false, hasPricing:false, hasFAQ:false, hasPrivacy:false, hasTerms:false, hasOrgSchema:false, hasSocial:false, socialPresence:[] });

    p('Computing Growth Score…', 94);

    const desc = this._extractDesc(doc);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content, desc),
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance, mobile,
      conversion,
      business,
      // External data — null if unavailable, UI labels appropriately
      indexing: indexing || { indexStatus: 'Unknown', robotsTxt: 'Not checked', noindex: false, nofollow: false },
      domain:   domain   || { hostname: new URL(url).hostname.replace(/^www\./, ''), da: null, daNote: 'Unavailable', rank: null, age: null },
      ranking:  ranking  || { hostname: new URL(url).hostname.replace(/^www\./, ''), globalRank: null, pageRank: null, source: null, perfScore: null },
      security: security || { https: url.startsWith('https://'), score: 0, grade: 'F', checks: [] },
    };

    // Growth Score computed last — depends on everything above
    this.currentData.growth = GrowthEngine.compute(this.currentData);

    p('Done!', 100);

    this._cacheSave(url, this.currentData);
    return this.currentData;
  }
};
