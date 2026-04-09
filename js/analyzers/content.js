const ContentAnalyzer = {
    analyze(doc) {
        const headings = [...doc.querySelectorAll('h1,h2,h3,h4')]
            .map(h => h.textContent.trim()).filter(Boolean);

        const paragraphs = [...doc.querySelectorAll('p')]
            .map(p => p.textContent.trim()).filter(t => t.length > 20);

        const metaKw = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

        const allText = [...headings, ...paragraphs, metaKw].join(' ').toLowerCase();
        const words = allText.replace(/[^\w\s]/g,'').split(/\s+/).filter(w => w.length > 4);

        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        const keywords = Object.entries(freq)
            .sort((a,b) => b[1]-a[1])
            .slice(0, 16)
            .map(([w]) => w);

        const topics = headings
            .filter(h => h.length > 3 && h.length < 70)
            .slice(0, 6);

        const tags = metaKw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);

        return { headings: headings.slice(0,10), paragraphCount: paragraphs.length, keywords, topics, tags, wordCount: words.length };
    }
};
