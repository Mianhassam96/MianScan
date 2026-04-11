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

  // ── Proxy pool — tried in order, first success wins
  PROXIES: [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(u)}`,
    u => `https://cors-anywhere.herokuapp.com/${u}`,
  ],

  async fetchHTML(url) {
    const errors = [];
    for (const proxy of this.PROXIES) {
      try {
        const ctrl  = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 14000);
        const res   = await fetch(proxy(url), { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) { errors.push(`${proxy(url).split('?')[0]} → HTTP ${res.status}`); continue; }
        const raw = await res.text();
        // allorigins wraps in JSON
        try {
          const j = JSON.parse(raw);
          if (j.contents && j.contents.length > 200) return j.contents;
        } catch (_) {}
        if (raw.length > 200) return raw;
        errors.push(`${proxy(url).split('?')[0]} → empty response`);
      } catch (e) {
        errors.push(`${proxy(url).split('?')[0]} → ${e.message}`);
      }
    }
    throw new Error('All proxies failed. The site may block external requests.\n' + errors.join('\n'));
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

    p('Done!', 100);

    const desc = this._extractDesc(doc);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content, desc),
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance, mobile,
      indexing: indexing || { indexStatus: 'Unknown', robotsTxt: 'Not checked', noindex: false, nofollow: false },
      domain:   domain   || { hostname: new URL(url).hostname.replace(/^www\./, ''), da: null, rank: null, age: null },
      ranking:  ranking  || { hostname: new URL(url).hostname.replace(/^www\./, ''), globalRank: null, pageRank: null, source: null },
      security: security || { https: url.startsWith('https://'), score: 0, grade: 'F', checks: [] },
    };
    // Save to cache
    this._cacheSave(url, this.currentData);
    return this.currentData;
  }
};
