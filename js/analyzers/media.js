const MediaAnalyzer = {
    analyze(doc, baseUrl) {
        const images = [...doc.querySelectorAll('img')]
            .map(img => ({
                src: img.src || img.getAttribute('src') || '',
                alt: img.getAttribute('alt') || ''
            }))
            .filter(i => i.src && !i.src.startsWith('data:'))
            .slice(0, 24);

        const videos = [...doc.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]')]
            .map(v => ({ src: v.src || v.getAttribute('src') || '' }))
            .filter(v => v.src).slice(0, 8);

        const logos = [...doc.querySelectorAll('img[class*="logo"], img[id*="logo"], img[alt*="logo" i], link[rel*="icon"]')]
            .map(el => el.src || el.href || el.getAttribute('src') || el.getAttribute('href') || '')
            .filter(Boolean).slice(0, 4);

        return { images, videos, logos, totalImages: images.length, totalVideos: videos.length };
    }
};
