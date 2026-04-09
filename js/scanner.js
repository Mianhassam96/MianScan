const Scanner = {
  currentData: null,

  // Multiple proxies — tries each until one works
  PROXIES: [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ],

  async fetch(url) {
    let lastErr;
    for (const proxy of this.PROXIES) {
      try {
        const res = await fetch(proxy(url), { signal: AbortSignal.timeout(12000) });
        if (!res.ok) continue;
        // allorigins returns JSON {contents}, others return raw HTML
        const text = await res.text();
        let html = text;
        try {
          const j = JSON.parse(text);
          if (j.contents) html = j.contents;
        } catch (_) { /* raw HTML — fine */ }
        if (html && html.trim().length > 100) return html;
      } catch (e) { lastErr = e; }
    }
    throw new Error('Could not fetch page. Try a different URL or check your connection.');
  },

  parse(html, baseUrl) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    try {
      const base = doc.createElement('base');
      base.href = baseUrl;
      doc.head.prepend(base);
    } catch (_) {}
    return doc;
  },

  _overview(doc, url, structure, content) {
    const title  = doc.querySelector('title')?.textContent?.trim() || new URL(url).hostname;
    const desc   = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const lang   = (doc.documentElement.getAttribute('lang') || 'en').split('-')[0].toUpperCase();
    const body   = (doc.body?.innerHTML || '').toLowerCase();
    let type = 'Website';
    if (/pricing|saas|dashboard|free trial|subscribe/i.test(body))  type = 'SaaS / Product';
    else if (/shop|cart|checkout|add to cart|buy now/i.test(body))  type = 'E-commerce';
    else if (/portfolio|my work|case stud/i.test(body))             type = 'Portfolio';
    else if (/\bblog\b|article|post|category/i.test(body))          type = 'Blog / Media';
    else if (/agency|services|we help|our team/i.test(body))        type = 'Agency / Services';
    else if (/\bdocs\b|documentation|api reference/i.test(body))    type = 'Documentation';
    return {
      title, desc, lang, type,
      sections: structure.tree.length,
      topic: content.topics[0] || content.keywords[0] || '—'
    };
  },

  async scan(url, onProgress) {
    const p = (msg, pct) => onProgress && onProgress(msg, pct);
    p('Fetching page...', 8);
    const html = await this.fetch(url);
    p('Parsing HTML...', 18);
    const doc = this.parse(html, url);
    p('Extracting colors...', 28);
    const colors = ColorAnalyzer.analyze(doc, html);
    p('Detecting fonts...', 36);
    const fonts = FontAnalyzer.analyze(doc, html);
    p('Analyzing structure...', 45);
    const structure = StructureAnalyzer.analyze(doc);
    p('Scanning content & CTAs...', 54);
    const content = ContentAnalyzer.analyze(doc);
    const cta = CTAAnalyzer.analyze(doc);
    p('Checking SEO...', 63);
    const seo = SEOAnalyzer.analyze(doc);
    p('Scanning media...', 72);
    const media = MediaAnalyzer.analyze(doc, url);
    p('Finding contacts...', 81);
    const contacts = ContactAnalyzer.analyze(doc, html);
    p('Detecting tech stack...', 90);
    const tech = TechAnalyzer.analyze(doc, html);
    p('Performance check...', 96);
    const performance = PerformanceAnalyzer.analyze(doc, html);
    p('Done!', 100);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._overview(doc, url, structure, content),
      colors, fonts, structure, content, cta, seo, media, contacts, tech, performance
    };
    return this.currentData;
  }
};
