const SEOAnalyzer = {
    analyze(doc) {
        const title = doc.querySelector('title')?.textContent?.trim() || '';
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
        const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
        const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '';
        const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
        const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';

        const h1s = [...doc.querySelectorAll('h1')].map(h => h.textContent.trim());
        const h2s = [...doc.querySelectorAll('h2')].map(h => h.textContent.trim()).slice(0, 5);
        const h3s = [...doc.querySelectorAll('h3')].map(h => h.textContent.trim()).slice(0, 5);

        const images = doc.querySelectorAll('img');
        const imagesWithAlt = [...images].filter(img => img.getAttribute('alt'));
        const imagesWithoutAlt = images.length - imagesWithAlt.length;

        // Score calculation
        let score = 0;
        if (title) score += 15;
        if (title.length >= 30 && title.length <= 60) score += 5;
        if (metaDesc) score += 15;
        if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 5;
        if (h1s.length === 1) score += 10;
        if (h2s.length > 0) score += 5;
        if (canonical) score += 5;
        if (ogTitle) score += 5;
        if (ogImage) score += 5;
        if (twitterCard) score += 5;
        if (viewport) score += 5;
        if (imagesWithoutAlt === 0) score += 10;
        else if (imagesWithoutAlt < 3) score += 5;
        if (metaKeywords) score += 5;

        return {
            score: Math.min(score, 100),
            title, metaDesc, metaKeywords, canonical,
            ogTitle, ogDesc, ogImage, twitterCard, robots, viewport,
            h1s, h2s, h3s,
            imagesTotal: images.length,
            imagesWithAlt: imagesWithAlt.length,
            imagesWithoutAlt
        };
    }
};
