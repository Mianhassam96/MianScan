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
        try { const j = JSON.parse(raw); if (j.contents && j.contents.length > 200) return j.contents; } catch(_) {}
        if (raw.length > 200) return raw;
      } catch(_) {}
    }
    throw new Error('All proxies failed. The site may block external requests.');
  },

  parse(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    try { const b = doc.createElement('base'); b.href = url; doc.head.prepend(b); } catch(_) {}
    return doc;
  },

  _overview(doc, url, structure, content) {
    const title = doc.querySelector('title')?.textContent?.trim() || new URL(url).hostname;
    const desc  = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const lang  = (doc.documentElement.getAttribute('lang') || 'en').split('-')[0].toUpperCase();
    const body  = (doc.body?.innerHTML || '').toLowerCase();
    let type = 'Website';
    if (/pricing|saas|dashboard|free trial|subscribe/i.test(body))  type = 'SaaS / Product';
    else if (/shop|cart|checkout|add to cart|buy now/i.test(body))  type = 'E-commerce';
    else if (/portfolio|my work|case stud/i.test(body))             type = 'Portfolio';
    else if (/\bblog\b|article|\bpost\b|category/i.test(body))      type = 'Blog / Media';
    else if (/agency|services|we help|our team/i.test(body))        type = 'Agency / Services';
    else if (/\bdocs\b|documentation|api reference/i.test(body))    type = 'Documentation';
    return { title, desc, lang, type, sections: structure.tree.length, topic: content.topics[0] || content.keywords[0]?.word || '—' };
  },

  async scan(url, onProgress) {
    const p = (msg, pct) => onProgress && onProgress(msg, pct);

    p('Fetching page…', 6);
    const html = await this.fetchHTML(url);
    p('Parsing HTML…', 13);
    const doc = this.parse(html, url);

    p('Extracting colors…', 20);
    const colors = ColorAnalyzer.analyze(doc, html);
    p('Detecting fonts…', 27);
    const fonts = FontAnalyzer.analyze(doc, html);
    p('Analyzing structure…', 33);
    const structure = StructureAnalyzer.analyze(doc);
    p('Scanning content…', 39);
    const content = ContentAnalyzer.analyze(doc);
    const cta = CTAAnalyzer.analyze(doc);
    p('Checking SEO…', 45);
    const seo = SEOAnalyzer.analyze(doc);
    p('Scanning media & links…', 52);
    const media = MediaAnalyzer.analyze(doc, url);
    const links = LinksAnalyzer.analyze(doc, url);
    p('Checking images SEO…', 58);
    const images = ImagesAnalyzer.analyze(doc, url);
    p('Finding contacts…', 64);
    const contacts = ContactAnalyzer.analyze(doc, html);
    p('Detecting tech stack…', 70);
    const tech = TechAnalyzer.analyze(doc, html);
    p('Performance check…', 75);
    const performance = PerformanceAnalyzer.analyze(doc, html);
    p('Checking indexing…', 80);
    const indexing = await IndexingAnalyzer.analyze(doc, html, url);
    p('Fetching domain authority…', 86);
    const domain = await DomainAnalyzer.analyze(url);
    p('Fetching ranking data…', 92);
    const ranking = await RankingAnalyzer.analyze(url);
    p('Done!', 100);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content),
      colors, fonts, structure, content, cta, seo,
      media, links, images, contacts, tech, performance,
      indexing, domain, ranking
    };
    return this.currentData;
  }
};
