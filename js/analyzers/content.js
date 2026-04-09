const ContentAnalyzer = {
    analyze(doc) {
        // Extract text
        const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.textContent.trim()).filter(Boolean);
        const paragraphs = [...doc.querySelectorAll('p')].map(p => p.textContent.trim()).filter(t => t.length > 20);
        const buttons = [...doc.querySelectorAll('button, [class*="btn"], a[class*="btn"]')].map(b => b.textContent.trim()).filter(Boolean);
        const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

        // All text combined
        const allText = [...headings, ...paragraphs, metaKeywords].join(' ').toLowerCase();

        // Extract keywords (top words)
        const words = allText.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);
        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        const keywords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word]) => word);

        // Topics (simple heuristic from headings)
        const topics = headings.slice(0, 6).filter(h => h.length > 3 && h.length < 80);

        // Tags from meta + keywords
        const tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);

        return {
            headings: headings.slice(0, 10),
            paragraphCount: paragraphs.length,
            buttons: [...new Set(buttons)].slice(0, 10),
            keywords,
            topics,
            tags,
            wordCount: words.length
        };
    }
};
