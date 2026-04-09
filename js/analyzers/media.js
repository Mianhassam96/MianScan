const MediaAnalyzer = {
  analyze(doc) {
    const images = [...doc.querySelectorAll('img')]
      .map(img => ({ src: img.src||img.getAttribute('src')||'', alt: img.getAttribute('alt')||'' }))
      .filter(i => i.src && !i.src.startsWith('data:'))
      .slice(0,24);
    const videos = [...doc.querySelectorAll('video,iframe[src*="youtube"],iframe[src*="vimeo"]')]
      .map(v => ({ src: v.src||v.getAttribute('src')||'' }))
      .filter(v=>v.src).slice(0,8);
    return { images, videos, totalImages: images.length, totalVideos: videos.length };
  }
};
