const ImagesAnalyzer = {
  analyze(doc, baseUrl) {
    const resolve = src => {
      if (!src) return '';
      if (src.startsWith('http')) return src;
      try { return new URL(src, baseUrl).href; } catch { return src; }
    };

    const imgs = [...doc.querySelectorAll('img')];
    const results = imgs.map(img => {
      const src    = resolve(img.getAttribute('src') || '');
      const alt    = img.getAttribute('alt');
      const width  = img.getAttribute('width')  || img.naturalWidth  || '';
      const height = img.getAttribute('height') || img.naturalHeight || '';
      const loading = img.getAttribute('loading') || '';
      const cls    = (img.className || '').toLowerCase();
      const isLazy = loading === 'lazy' || /lazy/i.test(cls) || img.hasAttribute('data-src');
      const ext    = src.split('?')[0].split('.').pop().toLowerCase();
      const isModern = ['webp','avif','svg'].includes(ext);

      return { src, alt: alt || '', hasAlt: alt !== null && alt !== undefined, width, height, isLazy, isModern, ext };
    }).filter(i => i.src && !i.src.startsWith('data:'));

    const withAlt    = results.filter(i => i.hasAlt && i.alt.trim()).length;
    const missingAlt = results.filter(i => !i.hasAlt || !i.alt.trim());
    const lazyCount  = results.filter(i => i.isLazy).length;
    const modernFmt  = results.filter(i => i.isModern).length;

    return {
      images: results.slice(0, 30),
      total: results.length,
      withAlt,
      missingAlt: missingAlt.slice(0, 15),
      missingAltCount: missingAlt.length,
      lazyCount,
      modernFmt,
      issues: [
        missingAlt.length > 0  ? { type:'warn', msg:`${missingAlt.length} image(s) missing alt text` }         : { type:'ok', msg:'All images have alt text' },
        lazyCount < results.length * 0.5 && results.length > 3
                               ? { type:'warn', msg:`Only ${lazyCount}/${results.length} images use lazy loading` } : { type:'ok', msg:`${lazyCount} image(s) use lazy loading` },
        modernFmt < results.length * 0.3 && results.length > 2
                               ? { type:'warn', msg:`Only ${modernFmt} image(s) use modern formats (WebP/AVIF)` }  : { type:'ok', msg:`${modernFmt} image(s) use modern formats` },
      ]
    };
  }
};
