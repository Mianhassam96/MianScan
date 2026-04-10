const Scanner = {
  currentData: null,

  PROXIES: [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  ],

  async fetchHTML(url) {
    for (const proxy of this.PROXIES) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 14000);
        const res = await fetch(proxy(url), { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) continue;
        const raw = await res.text();
        // allorigins wraps in JSON
        try {
          const j = JSON.parse(raw);
          if (j.contents && j.contents.length > 200) return j.contents;
        } catch (_) {}
        if (raw.length > 200) return raw;
      } catch (_) {}
    }
    throw new Error('All proxies failed. The site may block external requests.');
  },

  parse(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Don't prepend base tag — it breaks relative meta tag resolution
    // Instead resolve URLs manually in analyzers that need it
    return doc;
  },

  _extractDesc(doc, html) {
    // Try multiple ways to get description
    const selectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ];
    for (const sel of selectors) {
      const val = doc.querySelector(sel)?.getAttribute('content')?.trim();
      if (val && val.length > 5) return val;
    }
    // Fallback: first meaningful paragraph
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

    // ── Phase 1: Fetch & parse (sequential — must happen first)
    p('Fetching page…', 6);
    const html = await this.fetchHTML(url);
    p('Parsing HTML…', 13);
    const doc = this.parse(html, url);

    // ── Phase 2: All local analyzers in parallel (fast, no network)
    p('Analyzing page…', 20);
    const [
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance
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
    ]);

    p('Fetching external data…', 65);

    // ── Phase 3: All network analyzers in parallel (slow APIs)
    const [indexing, domain, ranking] = await Promise.allSettled([
      IndexingAnalyzer.analyze(doc, html, url),
      DomainAnalyzer.analyze(url),
      RankingAnalyzer.analyze(url),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

    p('Done!', 100);

    // Extract description properly (after base tag issue)
    const desc = this._extractDesc(doc, html);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content, desc),
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance,
      indexing: indexing || { indexStatus: 'Unknown', robotsTxt: 'Not checked', noindex: false, nofollow: false },
      domain:   domain   || { hostname: new URL(url).hostname.replace(/^www\./, ''), da: null, rank: null, age: null },
      ranking:  ranking  || { hostname: new URL(url).hostname.replace(/^www\./, ''), globalRank: null, pageRank: null, source: null }
    };
    return this.currentData;
  }
};
