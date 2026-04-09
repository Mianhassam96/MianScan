const MediaAnalyzer = {
    analyze(doc, baseUrl) {
        const origin = new URL(baseUrl).origin;

        const images = [...doc.querySelectorAll('img')].map(img => ({
            src: img.src || img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            width: img.getAttribute('width') || '',
            height: img.getAttribute('height') || '',
        })).filter(i => i.src).slice(0, 30);

        const videos = [...doc.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]')].map(v => ({
            src: v.src || v.getAttribute('src') || '',
            type: v.tagName.toLowerCase()
        })).filter(v => v.src).slice(0, 10);

        // Background images from inline styles
        const bgImages = [];
        doc.querySelectorAll('[style*="background"]').forEach(el => {
            const style = el.getAttribute('style') || '';
            const m = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
            if (m) bgImages.push({ src: m[1], type: 'background' });
        });

        // Favicons / logos
        const logos = [...doc.querySelectorAll('link[rel*="icon"], img[class*="logo"], img[id*="logo"]')].map(el => ({
            src: el.href || el.src || el.getAttribute('href') || el.getAttribute('src') || '',
            type: 'logo'
        })).filter(l => l.src).slice(0, 5);

        return {
            images,
            videos,
            bgImages: bgImages.slice(0, 10),
            logos,
            totalImages: images.length,
            totalVideos: videos.length
        };
    }
};
