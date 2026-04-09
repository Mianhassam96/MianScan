const FontAnalyzer = {
    analyze(doc, html) {
        const fonts = new Map();
        const css = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ') + html;

        const reg = /font-family\s*:\s*([^;}"'\n]+)/gi;
        let m;
        while ((m = reg.exec(css)) !== null) {
            m[1].split(',').forEach(f => {
                const name = f.trim().replace(/['"]/g,'').trim();
                if (name && name.length > 1 && !this.generic(name)) {
                    if (!fonts.has(name)) fonts.set(name, { name, weights: new Set(), googleFont: false });
                }
            });
        }

        // Google Fonts links
        doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            const fam = href.match(/family=([^&]+)/);
            if (fam) {
                fam[1].split('|').forEach(f => {
                    const parts = f.split(':');
                    const name = decodeURIComponent(parts[0]).replace(/\+/g,' ').trim();
                    if (!fonts.has(name)) fonts.set(name, { name, weights: new Set(), googleFont: true });
                    else fonts.get(name).googleFont = true;
                    if (parts[1]) parts[1].split(',').forEach(w => fonts.get(name).weights.add(w));
                });
            }
        });

        // Font weights
        const wReg = /font-weight\s*:\s*(\d+|bold|normal)/gi;
        while ((m = wReg.exec(css)) !== null) {
            fonts.forEach(f => f.weights.add(m[1]));
        }

        const result = [...fonts.values()].slice(0, 8).map(f => ({
            name: f.name,
            weights: [...f.weights].filter(Boolean).join(', ') || '400',
            googleFont: f.googleFont,
            googleLink: `https://fonts.google.com/specimen/${encodeURIComponent(f.name)}`
        }));

        return { fonts: result, total: result.length };
    },

    generic(n) {
        return /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit|initial|unset|var|Arial|Helvetica|Georgia|Times|Verdana|Tahoma|Trebuchet|Courier|Impact|Comic)$/i.test(n);
    }
};
