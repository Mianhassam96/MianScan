const Scanner = {
    PROXY: 'https://api.allorigins.win/get?url=',
    currentData: null,

    validateUrl(url) {
        let parsed;
        try { parsed = new URL(url); } catch { throw new Error('Invalid URL'); }
        if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only HTTP/HTTPS URLs are allowed');
        const host = parsed.hostname.toLowerCase();
        if (/^(localhost|.*\.local)$/.test(host) ||
            /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|127\.\d+\.\d+\.\d+|169\.254\.\d+\.\d+|::1|0\.0\.0\.0)$/.test(host)) {
            throw new Error('Private/internal addresses are not allowed');
        }
    },

    async fetch(url) {
        this.validateUrl(url);
        const res = await fetch(this.PROXY + encodeURIComponent(url));
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (!json.contents) throw new Error('Empty response — site may block scrapers');
        return json.contents;
    },

    parse(html, baseUrl) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const base = doc.createElement('base');
        base.href = baseUrl;
        doc.head.prepend(base);
        return doc;
    },

    async scan(url, onProgress) {
        const steps = [
            [10,  'Fetching page...'],
            [22,  'Parsing HTML...'],
            [34,  'Extracting colors...'],
            [44,  'Detecting fonts...'],
            [52,  'Analyzing structure...'],
            [60,  'Scanning content & CTAs...'],
            [68,  'Checking SEO...'],
            [76,  'Scanning media...'],
            [83,  'Finding contacts...'],
            [90,  'Detecting tech stack...'],
            [96,  'Performance & accessibility...'],
            [100, 'Done!'],
        ];
        let i = 0;
        const p = (idx) => onProgress && onProgress(steps[idx][1], steps[idx][0]);

        p(i++);
        const html = await this.fetch(url);
        p(i++);
        const doc = this.parse(html, url);

        p(i++); const colors      = ColorAnalyzer.analyze(doc, html);
        p(i++); const fonts       = FontAnalyzer.analyze(doc, html);
        p(i++); const structure   = StructureAnalyzer.analyze(doc);
        p(i++); const content     = ContentAnalyzer.analyze(doc);
                const cta         = CTAAnalyzer.analyze(doc);
        p(i++); const seo         = SEOAnalyzer.analyze(doc);
        p(i++); const media       = MediaAnalyzer.analyze(doc, url);
        p(i++); const contacts    = ContactAnalyzer.analyze(doc, html);
        p(i++); const tech        = TechAnalyzer.analyze(doc, html);
        p(i++); const performance = PerformanceAnalyzer.analyze(doc, html);
        p(i);

        this.currentData = {
            url,
            scannedAt: new Date().toISOString(),
            overview: OverviewBuilder.build(doc, url, structure, content),
            colors, fonts, structure, content, cta,
            seo, media, contacts, tech, performance
        };
        return this.currentData;
    }
};

// Builds the top overview from multiple signals
const OverviewBuilder = {
    build(doc, url, structure, content) {
        const title = doc.querySelector('title')?.textContent?.trim() || new URL(url).hostname;
        const desc  = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
        const lang  = doc.documentElement.lang || doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') || 'en';

        // Business type heuristic
        const html = doc.body?.innerHTML?.toLowerCase() || '';
        let type = 'Website';
        if (/pricing|plan|subscribe|saas|dashboard|free trial/i.test(html)) type = 'SaaS / Product';
        else if (/shop|cart|checkout|product|buy now|add to cart/i.test(html)) type = 'E-commerce';
        else if (/portfolio|my work|projects|case stud/i.test(html)) type = 'Portfolio';
        else if (/blog|article|post|category|tag/i.test(html)) type = 'Blog / Media';
        else if (/agency|services|we help|our team|clients/i.test(html)) type = 'Agency / Services';
        else if (/docs|documentation|api|reference|guide/i.test(html)) type = 'Documentation';

        const sections = structure.tree.length;
        const topic = content.topics[0] || content.keywords[0] || '—';

        return { title, desc, lang: lang.split('-')[0].toUpperCase(), type, sections, topic };
    }
};
