const FontAnalyzer = {
  analyze(doc, html) {
    const styleSrc = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ')
                   + [...doc.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join(' ');

    const map = new Map();
    let m;

    // Extract font-family declarations with optional weight context
    const re = /font-family\s*:\s*([^;}"'\n]+)/gi;
    while ((m = re.exec(styleSrc))) {
      m[1].split(',').forEach(f => {
        const name = f.trim().replace(/['"]/g, '').trim();
        if (this._valid(name)) {
          if (!map.has(name)) map.set(name, { name, weights: new Set(), google: false });
        }
      });
    }

    // Extract font shorthand: font: bold 16px "Font Name"
    const shortRe = /\bfont\s*:\s*[^;{}"'\n]*["']([^"']+)["']/gi;
    while ((m = shortRe.exec(styleSrc))) {
      const name = m[1].trim();
      if (this._valid(name)) {
        if (!map.has(name)) map.set(name, { name, weights: new Set(), google: false });
      }
    }

    // Extract font-weight per font from surrounding context
    const weightRe = /font-weight\s*:\s*(\d{3}|bold|normal|lighter|bolder)/gi;
    // Simple heuristic: collect all weights found in style blocks
    const allWeights = new Set();
    while ((m = weightRe.exec(styleSrc))) allWeights.add(m[1]);

    // Google Fonts link tags
    doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      // Support both v1 (?family=) and v2 (?family= with axis)
      const familyParam = href.match(/family=([^&]+)/);
      if (!familyParam) return;
      decodeURIComponent(familyParam[1]).split('|').forEach(f => {
        // v2 format: "Font+Name:ital,wght@0,400;1,700"
        const colonIdx = f.indexOf(':');
        const rawName = colonIdx > -1 ? f.slice(0, colonIdx) : f;
        const name = rawName.replace(/\+/g, ' ').trim();
        if (!this._valid(name)) return;
        if (!map.has(name)) map.set(name, { name, weights: new Set(), google: true });
        else map.get(name).google = true;
        // Extract weights from v1 (wts) or v2 axis
        const wts = colonIdx > -1 ? f.slice(colonIdx + 1) : '';
        const wNums = wts.match(/\d{3}/g) || [];
        wNums.forEach(w => map.get(name).weights.add(w));
      });
    });

    // Also check @import in style tags for Google Fonts
    const importRe = /@import\s+url\(['"]?([^'")\s]+)['"]?\)/gi;
    while ((m = importRe.exec(styleSrc))) {
      const href = m[1];
      if (!href.includes('fonts.googleapis.com')) continue;
      const familyParam = href.match(/family=([^&]+)/);
      if (!familyParam) continue;
      decodeURIComponent(familyParam[1]).split('|').forEach(f => {
        const name = f.split(':')[0].replace(/\+/g, ' ').trim();
        if (!this._valid(name)) return;
        if (!map.has(name)) map.set(name, { name, weights: new Set(), google: true });
        else map.get(name).google = true;
      });
    }

    const fonts = [...map.values()].slice(0, 8).map(f => ({
      name: f.name,
      weights: [...f.weights].filter(Boolean).join(', ') || '400',
      google: f.google,
      link: `https://fonts.google.com/specimen/${encodeURIComponent(f.name)}`
    }));

    return { fonts, total: fonts.length };
  },

  _valid(name) {
    if (!name) return false;
    // Skip CSS variables, SCSS vars, custom properties
    if (name.startsWith('var(') || name.startsWith('--') || name.startsWith('$')) return false;
    // Skip single chars or numbers-only
    if (name.length <= 1) return false;
    if (/^\d+$/.test(name)) return false;
    // Skip generic/system fonts
    return !this._generic(name);
  },

  _generic(n) {
    return /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|inherit|initial|unset|revert|none|normal|auto|Arial|Helvetica|Georgia|Times New Roman|Times|Verdana|Tahoma|Trebuchet MS|Trebuchet|Courier New|Courier|Impact|Comic Sans MS|Comic Sans|Comic|Palatino|Garamond|Bookman|Avant Garde|Century Gothic|Lucida|Lucida Sans|Lucida Console|Geneva|Optima|Candara|Calibri|Cambria|Constantia|Corbel|Franklin Gothic|Gill Sans|Segoe UI|Segoe|Roboto|Open Sans|Lato|Montserrat|Oswald|Source Sans Pro|Raleway|PT Sans|Merriweather|Noto Sans|Ubuntu|Nunito|Poppins|Inter|system|BlinkMacSystemFont|-apple-system)$/i.test(n);
  }
};
