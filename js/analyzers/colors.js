const ColorAnalyzer = {
    analyze(doc, html) {
        const found = new Set();

        // From inline styles and style tags
        const styleBlocks = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ');
        const inlineStyles = [...doc.querySelectorAll('[style]')].map(el => el.getAttribute('style')).join(' ');
        const allCSS = styleBlocks + ' ' + inlineStyles + ' ' + html;

        // Extract hex colors
        const hexReg = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
        let m;
        while ((m = hexReg.exec(allCSS)) !== null) {
            const hex = this.normalizeHex(m[0]);
            if (hex) found.add(hex);
        }

        // Extract rgb/rgba
        const rgbReg = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
        while ((m = rgbReg.exec(allCSS)) !== null) {
            const hex = this.rgbToHex(+m[1], +m[2], +m[3]);
            if (hex) found.add(hex);
        }

        // Filter out pure black/white noise and limit
        const colors = [...found]
            .filter(c => c !== '#000000' && c !== '#ffffff' && c !== '#000' && c !== '#fff')
            .slice(0, 30);

        return { colors, total: colors.length };
    },

    normalizeHex(hex) {
        hex = hex.toLowerCase();
        if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex.length === 7 ? hex : null;
    },

    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255) return null;
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    },

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
};
