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
        try { const j = JSON.parse(raw); if (j.contents && j.contents.length > 200) return j.contents; } catch(_){}
        if (raw.length > 200) return raw;
      } catch(_) { /* try next */ }
    }
    throw new Error('All proxies failed. The site may block external requests.');
  },

  parse(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    try { const b = doc.createElement('base'); b.href = url; doc.head.prepend(b); } catch(_){}
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
    return { title, desc, lang, type, sections: structure.tree.length, topic: content.topics[0] || content.keywords[0] || '—' };
  },

  async scan(url, onProgress) {
    const p = (msg, pct) => onProgress && onProgress(msg, pct);
    p('Fetching page…', 8);
    const html = await this.fetchHTML(url);
    p('Parsing HTML…', 18);
    const doc = this.parse(html, url);
    p('Extracting colors…', 27);
    const colors = ColorAnalyzer.analyze(doc, html);
    p('Detecting fonts…', 36);
    const fonts = FontAnalyzer.analyze(doc, html);
    p('Analyzing structure…', 45);
    const structure = StructureAnalyzer.analyze(doc);
    p('Scanning content & CTAs…', 54);
    const content = ContentAnalyzer.analyze(doc);
    const cta = CTAAnalyzer.analyze(doc);
    p('Checking SEO…', 63);
    const seo = SEOAnalyzer.analyze(doc);
    p('Scanning media…', 72);
    const media = MediaAnalyzer.analyze(doc, url);
    p('Analyzing links…', 78);
    const links = LinksAnalyzer.analyze(doc, url);
    p('Checking images SEO…', 84);
    const images = ImagesAnalyzer.analyze(doc, url);
    p('Finding contacts…', 88);
    const contacts = ContactAnalyzer.analyze(doc, html);
    p('Detecting tech stack…', 90);
    const tech = TechAnalyzer.analyze(doc, html);
    p('Performance check…', 96);
    const performance = PerformanceAnalyzer.analyze(doc, html);
    p('Done!', 100);
    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content),
      colors, fonts, structure, content, cta, seo, media, links, images, contacts, tech, performance
    };
    return this.currentData;
  }
};
