const Scanner = {
  PROXY: 'https://api.allorigins.win/get?url=',
  currentData: null,

  async fetch(url) {
    const res = await fetch(this.PROXY + encodeURIComponent(url));
    if (!res.ok) throw new Error('Network error — check your connection');
    const json = await res.json();
    if (!json.contents) throw new Error('No content returned — site may block scrapers');
    return json.contents;
  },

  parse(html, baseUrl) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const base = doc.createElement('base');
    base.href = baseUrl;
    doc.head.prepend(base);
    return doc;
  },

  _buildOverview(doc, url, structure, content) {
    const title   = doc.querySelector('title')?.textContent?.trim() || new URL(url).hostname;
    const desc    = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const lang    = (doc.documentElement.lang || 'en').split('-')[0].toUpperCase();
    const body    = (doc.body?.innerHTML || '').toLowerCase();
    let type = 'Website';
    if (/pricing|plan|subscribe|saas|dashboard|free trial/i.test(body))   type = 'SaaS / Product';
    else if (/shop|cart|checkout|add to cart|buy now/i.test(body))         type = 'E-commerce';
    else if (/portfolio|my work|case stud/i.test(body))                    type = 'Portfolio';
    else if (/blog|article|post|category/i.test(body))                     type = 'Blog / Media';
    else if (/agency|services|we help|our team/i.test(body))               type = 'Agency / Services';
    else if (/docs|documentation|api reference/i.test(body))               type = 'Documentation';
    return { title, desc, lang, type, sections: structure.tree.length, topic: content.topics[0] || content.keywords[0] || '—' };
  },

  async scan(url, onProgress) {
    const step = (msg, pct) => onProgress && onProgress(msg, pct);
    step('Fetching page...', 8);
    const html = await this.fetch(url);
    step('Parsing HTML...', 18);
    const doc = this.parse(html, url);
    step('Extracting colors...', 28);
    const colors = ColorAnalyzer.analyze(doc, html);
    step('Detecting fonts...', 38);
    const fonts = FontAnalyzer.analyze(doc, html);
    step('Analyzing structure...', 48);
    const structure = StructureAnalyzer.analyze(doc);
    step('Scanning content & CTAs...', 57);
    const content = ContentAnalyzer.analyze(doc);
    const cta = CTAAnalyzer.analyze(doc);
    step('Checking SEO...', 66);
    const seo = SEOAnalyzer.analyze(doc);
    step('Scanning media...', 74);
    const media = MediaAnalyzer.analyze(doc);
    step('Finding contacts...', 82);
    const contacts = ContactAnalyzer.analyze(doc, html);
    step('Detecting tech stack...', 90);
    const tech = TechAnalyzer.analyze(doc, html);
    step('Performance check...', 96);
    const performance = PerformanceAnalyzer.analyze(doc, html);
    step('Done!', 100);

    this.currentData = {
      url, scannedAt: new Date().toISOString(),
      overview: this._buildOverview(doc, url, structure, content),
      colors, fonts, structure, content, cta, seo, media, contacts, tech, performance
    };
    return this.currentData;
  }
};
