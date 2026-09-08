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
  // Primary:  Your deployed Cloudflare Worker (cors-worker/worker.js)
  //           Free, 100k req/day, no rate limits. Deploy once at:
  //           https://dash.cloudflare.com → Workers & Pages → Create Worker
  //           Then update WORKER_URL below with your worker's URL.
  //
  // Fallback: cors.lol — confirmed working public proxy (no key needed)
  //
  // Hard cap: FETCH_TIMEOUT_MS covers the entire fetch attempt.
  //           If both worker and fallback fail within this window → clean error.

  WORKER_URL: 'https://mianscan-proxy.multimian.workers.dev',
  FETCH_TIMEOUT_MS: 12000,  // 12 seconds total — hard cap across all attempts

  // Error type codes — used by app.js to show the right message
  ERR_TIMEOUT:  'ERR_TIMEOUT',
  ERR_BLOCKED:  'ERR_BLOCKED',
  ERR_EMPTY:    'ERR_EMPTY',
  ERR_INVALID:  'ERR_INVALID',
  ERR_SCANNER:  'ERR_SCANNER',

  async fetchHTML(url) {
    // Race: worker (primary) vs cors.lol (fallback) — first valid response wins
    // Both fire simultaneously; we take whichever replies first with real HTML.
    // If both fail → throw a typed error.

    const deadline = AbortSignal.timeout
      ? AbortSignal.timeout(this.FETCH_TIMEOUT_MS)
      : (() => { const c = new AbortController(); setTimeout(() => c.abort(), this.FETCH_TIMEOUT_MS); return c.signal; })();

    const tryFetch = async (proxyUrl, jsonKey = null) => {
      const res = await fetch(proxyUrl, { signal: deadline });
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { code: res.status >= 500 ? this.ERR_SCANNER : this.ERR_BLOCKED });
      const raw = await res.text();

      // Unwrap JSON-envelope format (allorigins-style)
      if (jsonKey) {
        try { const j = JSON.parse(raw); if (j[jsonKey]?.length > 200) return j[jsonKey]; } catch (_) {}
      }
      // Any proxy may return JSON with a contents key
      try { const j = JSON.parse(raw); if (j.contents?.length > 200) return j.contents; } catch (_) {}

      if (raw.length > 200) return raw;
      throw Object.assign(new Error('Empty response'), { code: this.ERR_EMPTY });
    };

    const workerUrl  = `${this.WORKER_URL}/?url=${encodeURIComponent(url)}`;
    const fallbackUrl = `https://api.cors.lol/?url=${encodeURIComponent(url)}`;

    try {
      // Fire both simultaneously — settle as soon as one succeeds
      return await Promise.any([
        tryFetch(workerUrl),
        tryFetch(fallbackUrl),
      ]);
    } catch (aggErr) {
      // Both failed — determine the most informative error code
      const errors = aggErr.errors || [];
      const isTimeout = deadline.aborted || errors.some(e => e.name === 'AbortError' || e.name === 'TimeoutError');
      const isBlocked = errors.some(e => e.code === this.ERR_BLOCKED);
      const isEmpty   = errors.every(e => e.code === this.ERR_EMPTY);

      const code = isTimeout ? this.ERR_TIMEOUT
                 : isEmpty   ? this.ERR_EMPTY
                 : isBlocked ? this.ERR_BLOCKED
                              : this.ERR_SCANNER;

      throw Object.assign(
        new Error(code),
        { code, details: errors.map(e => e.message).join(' | ') }
      );
    }
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

    p('Fetching page…', 6);
    const html = await this.fetchHTML(url);
    p('Parsing HTML…', 13);
    const doc = this.parse(html);

    p('Running analyzers…', 20);
    const [
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance, mobile
    ] = await Promise.all([
      Promise.resolve(ColorAnalyzer.analyze(doc, html)),
      Promise.resolve(FontAnalyzer.analyze(doc, html)),
      Promise.resolve(StructureAnalyzer.analyze(doc)),
      Promise.resolve(ContentAnalyzer.analyze(doc)),
      Promise.resolve(CTAAnalyzer.analyze(doc)),
      Promise.resolve(SEOAnalyzer.analyze(doc)),
      Promise.resolve(MediaAnalyzer.analyze(doc, url)),
      Promise.resolve(LinksAnalyzer.analyze(doc, url)),
      Promise.resolve(ImagesAnalyzer.analyze(doc, url)),
      Promise.resolve(ContactAnalyzer.analyze(doc, html)),
      Promise.resolve(TechAnalyzer.analyze(doc, html)),
      Promise.resolve(PerformanceAnalyzer.analyze(doc, html)),
      Promise.resolve(MobileAnalyzer.analyze(doc, html)),
    ]);

    p('Fetching external data…', 55);

    const [indexing, domain, ranking, security] = await Promise.allSettled([
      IndexingAnalyzer.analyze(doc, html, url),
      DomainAnalyzer.analyze(url),
      RankingAnalyzer.analyze(url),
      SecurityAnalyzer.analyze(url, doc, html),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

    p('Computing growth score…', 92);

    // ── Conversion analyzer (synchronous, uses raw HTML)
    const conversion = ConversionAnalyzer.analyze(doc, html);

    const desc = this._extractDesc(doc);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content, desc),
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance, mobile,
      conversion,
      indexing: indexing || { indexStatus: 'Unknown', robotsTxt: 'Not checked', noindex: false, nofollow: false },
      domain:   domain   || { hostname: new URL(url).hostname.replace(/^www\./, ''), da: null, rank: null, age: null },
      ranking:  ranking  || { hostname: new URL(url).hostname.replace(/^www\./, ''), globalRank: null, pageRank: null, source: null },
      security: security || { https: url.startsWith('https://'), score: 0, grade: 'F', checks: [] },
    };

    // ── Growth Score (computed last, depends on all other data including security/ranking)
    this.currentData.growth = GrowthEngine.compute(this.currentData);

    p('Done!', 100);

    // Save to cache
    this._cacheSave(url, this.currentData);
    return this.currentData;
  }
};
