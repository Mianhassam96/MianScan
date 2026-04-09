const MediaAnalyzer = {
  analyze(doc, baseUrl) {
    // resolve relative URLs
    const resolve = (src) => {
      if (!src) return '';
      if (src.startsWith('http')) return src;
      try { return new URL(src, baseUrl).href; } catch { return src; }
    };

    const images = [...doc.querySelectorAll('img')]
      .map(img => ({
        src: resolve(img.getAttribute('src') || ''),
        alt: img.getAttribute('alt') || ''
      }))
      .filter(i => i.src && !i.src.startsWith('data:'))
      .slice(0, 24);

    const videos = [...doc.querySelectorAll('video source, video, iframe[src*="youtube"], iframe[src*="vimeo"]')]
      .map(v => ({ src: resolve(v.getAttribute('src') || '') }))
      .filter(v => v.src).slice(0, 8);

    return { images, videos, totalImages: images.length, totalVideos: videos.length };
  }
};
