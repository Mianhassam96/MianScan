const FontAnalyzer = {
    analyze(doc, html) {
        const fonts = new Map();

        // From CSS font-family declarations
        const allCSS = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ') + html;
        const fontFamilyReg = /font-family\s*:\s*([^;}"']+)/gi;
        let m;
        while ((m = fontFamilyReg.exec(allCSS)) !== null) {
            const raw = m[1].trim();
            raw.split(',').forEach(f => {
                const name = f.trim().replace(/['"]/g, '').split(' ')[0];
                if (name && name.length > 1 && !this.isGeneric(name)) {
                    fonts.set(name, fonts.get(name) || { name, weights: new Set(), uses: [] });
                }
            });
        }

        // From Google Fonts links
        const gfLinks = [...doc.querySelectorAll('link[href*="fonts.googleapis.com"]')];
        gfLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const familyMatch = href.match(/family=([^&]+)/);
            if (familyMatch) {
                familyMatch[1].split('|').forEach(f => {
                    const parts = f.split(':');
                    const name = decodeURIComponent(parts[0]).replace(/\+/g, ' ');
                    if (!fonts.has(name)) fonts.set(name, { name, weights: new Set(), uses: [], googleFont: true });
                    if (parts[1]) parts[1].split(',').forEach(w => fonts.get(name).weights.add(w));
                });
            }
        });

        // Detect heading/body usage
        const headings = [...doc.querySelectorAll('h1,h2,h3')];
        const body = doc.body;

        const result = [...fonts.values()].slice(0, 10).map(f => ({
            name: f.name,
            weights: [...f.weights].join(', ') || '400',
            googleFont: f.googleFont || false,
            googleLink: f.googleFont ? `https://fonts.google.com/specimen/${f.name.replace(/ /g, '+')}` : null
        }));

        return { fonts: result, total: result.length };
    },

    isGeneric(name) {
        const generics = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'initial', 'unset', 'var', 'Arial', 'Helvetica', 'Georgia', 'Times', 'Verdana', 'Tahoma', 'Trebuchet'];
        return generics.some(g => g.toLowerCase() === name.toLowerCase());
    }
};
