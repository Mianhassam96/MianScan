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
  // Proxy pool tested live — tried in parallel batches for speed.
  // Fastest valid response wins. Total hard cap: 15s.
  //
  // To add a reliable primary: deploy cors-worker/worker.js to Cloudflare
  // (free, 100k req/day) and set WORKER_URL to your deployed URL.

  WORKER_URL: 'https://mianscan-proxy.multimian.workers.dev',
  FETCH_TIMEOUT_MS: 15000,

  ERR_TIMEOUT:  'ERR_TIMEOUT',
  ERR_BLOCKED:  'ERR_BLOCKED',
  ERR_EMPTY:    'ERR_EMPTY',
  ERR_INVALID:  'ERR_INVALID',
  ERR_SCANNER:  'ERR_SCANNER',

  // Is the CF worker actually deployed (not the placeholder URL)?
  _workerReady() {
    // If WORKER_URL has been changed from the default placeholder, assume deployed
    return this.WORKER_URL !== 'https://mianscan-proxy.multimian.workers.dev';
  },

  async fetchHTML(url) {
    const errors  = [];
    const timeout = this.FETCH_TIMEOUT_MS;

    // Fetch through a proxy URL, unwrap JSON envelopes if needed
    const tryProxy = async (proxyUrl, jsonKey = null, ms = timeout) => {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) {
          const code = (res.status === 401 || res.status === 403) ? this.ERR_BLOCKED : this.ERR_SCANNER;
          throw Object.assign(new Error(`HTTP ${res.status}`), { code });
        }
        const raw = await res.text();
        // Unwrap allorigins-style JSON envelope
        if (jsonKey) {
          try {
            const j = JSON.parse(raw);
            if (j[jsonKey] && j[jsonKey].length > 200) return j[jsonKey];
          } catch (_) {}
        }
        // Generic JSON unwrap attempt
        try {
          const j = JSON.parse(raw);
          if (j.contents && j.contents.length > 200) return j.contents;
        } catch (_) {}
        if (raw.length > 200) return raw;
        throw Object.assign(new Error('Empty response'), { code: this.ERR_EMPTY });
      } catch (e) {
        clearTimeout(timer);
        const code = e.name === 'AbortError' ? this.ERR_TIMEOUT : (e.code || this.ERR_SCANNER);
        throw Object.assign(e, { code });
      }
    };

    // ── Round 1: CF Worker (if deployed) + cors.lol — race simultaneously
    const round1 = [];
    if (this._workerReady()) {
      round1.push(
        tryProxy(`${this.WORKER_URL}/?url=${encodeURIComponent(url)}`, null, 12000)
          .catch(e => { errors.push(`worker → ${e.message}`); return Promise.reject(e); })
      );
    }
    round1.push(
      tryProxy(`https://api.cors.lol/?url=${encodeURIComponent(url)}`, null, 10000)
        .catch(e => { errors.push(`cors.lol → ${e.message}`); return Promise.reject(e); })
    );

    if (round1.length > 0) {
      try {
        return await Promise.any(round1);
      } catch (_) {
        // fall through to round 2
      }
    }

    // ── Round 2: allorigins + corsproxy.io (sequentially — they're less reliable)
    try {
      return await tryProxy(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        'contents', 12000
      );
    } catch (e) { errors.push(`allorigins → ${e.message}`); }

    try {
      return await tryProxy(
        `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        null, 10000
      );
    } catch (e) { errors.push(`corsproxy.io → ${e.message}`); }

    // ── All failed
    const isTimeout = errors.some(e => /timeout|abort/i.test(e));
    const isBlocked = errors.some(e => /403|401|blocked/i.test(e));
    const isEmpty   = errors.every(e => /empty/i.test(e));
    const code = isTimeout ? this.ERR_TIMEOUT
               : isEmpty   ? this.ERR_EMPTY
               : isBlocked ? this.ERR_BLOCKED
                           : this.ERR_SCANNER;

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
