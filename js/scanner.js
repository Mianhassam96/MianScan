/**
 * scanner.js — Core Engine
 * Fetches and parses the target website HTML
 */
const Scanner = {
    PROXY: 'https://api.allorigins.win/get?url=',
    currentData: null,

    async fetch(url) {
        const proxyUrl = this.PROXY + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Failed to fetch via proxy');
        const json = await res.json();
        if (!json.contents) throw new Error('Empty response from proxy');
        return json.contents;
    },

    parse(html, baseUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Fix relative URLs
        const base = doc.createElement('base');
        base.href = baseUrl;
        doc.head.prepend(base);
        return doc;
    },

    async scan(url, onProgress) {
        const steps = [
            { label: 'Fetching page...', pct: 10 },
            { label: 'Parsing HTML...', pct: 20 },
            { label: 'Extracting colors...', pct: 32 },
            { label: 'Detecting fonts...', pct: 44 },
            { label: 'Analyzing structure...', pct: 54 },
            { label: 'Scanning content...', pct: 64 },
            { label: 'Checking SEO...', pct: 72 },
            { label: 'Scanning media...', pct: 80 },
            { label: 'Finding contacts...', pct: 86 },
            { label: 'Detecting tech stack...', pct: 92 },
            { label: 'Performance check...', pct: 97 },
            { label: 'Done!', pct: 100 },
        ];

        let step = 0;
        const progress = (label, pct) => onProgress && onProgress(label, pct);

        progress(steps[step].label, steps[step].pct); step++;

        const html = await this.fetch(url);
        progress(steps[step].label, steps[step].pct); step++;

        const doc = this.parse(html, url);

        progress(steps[step].label, steps[step].pct); step++;
        const colors = ColorAnalyzer.analyze(doc, html);

        progress(steps[step].label, steps[step].pct); step++;
        const fonts = FontAnalyzer.analyze(doc, html);

        progress(steps[step].label, steps[step].pct); step++;
        const structure = StructureAnalyzer.analyze(doc);

        progress(steps[step].label, steps[step].pct); step++;
        const content = ContentAnalyzer.analyze(doc);

        progress(steps[step].label, steps[step].pct); step++;
        const seo = SEOAnalyzer.analyze(doc);

        progress(steps[step].label, steps[step].pct); step++;
        const media = MediaAnalyzer.analyze(doc, url);

        progress(steps[step].label, steps[step].pct); step++;
        const contacts = ContactAnalyzer.analyze(doc, html);

        progress(steps[step].label, steps[step].pct); step++;
        const tech = TechAnalyzer.analyze(doc, html);

        progress(steps[step].label, steps[step].pct); step++;
        const performance = PerformanceAnalyzer.analyze(doc, html);

        progress(steps[step].label, steps[step].pct);

        this.currentData = { url, scannedAt: new Date().toISOString(), colors, fonts, structure, content, seo, media, contacts, tech, performance };
        return this.currentData;
    }
};
