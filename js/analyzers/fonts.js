const FontAnalyzer = {
  analyze(doc, html) {
    const src = [...doc.querySelectorAll('style')].map(s=>s.textContent).join(' ') + html;
    const map = new Map();
    let m;
    const re = /font-family\s*:\s*([^;}"'\n]+)/gi;
    while ((m = re.exec(src))) {
      m[1].split(',').forEach(f => {
        const name = f.trim().replace(/['"]/g,'').trim();
        if (name && name.length > 1 && !this._generic(name)) {
          if (!map.has(name)) map.set(name, { name, weights: new Set(), google: false });
        }
      });
    }
    doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
      const fam = (link.getAttribute('href')||'').match(/family=([^&]+)/);
      if (!fam) return;
      fam[1].split('|').forEach(f => {
        const [fname, wts] = f.split(':');
        const name = decodeURIComponent(fname).replace(/\+/g,' ').trim();
        if (!map.has(name)) map.set(name, { name, weights: new Set(), google: true });
        else map.get(name).google = true;
        if (wts) wts.split(',').forEach(w => map.get(name).weights.add(w));
      });
    });
    const fonts = [...map.values()].slice(0,8).map(f => ({
      name: f.name,
      weights: [...f.weights].filter(Boolean).join(', ') || '400',
      google: f.google,
      link: `https://fonts.google.com/specimen/${encodeURIComponent(f.name)}`
    }));
    return { fonts, total: fonts.length };
  },
  _generic(n) {
    return /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit|initial|unset|var|Arial|Helvetica|Georgia|Times|Verdana|Tahoma|Trebuchet|Courier|Impact|Comic)$/i.test(n);
  }
};
