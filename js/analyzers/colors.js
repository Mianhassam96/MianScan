const ColorAnalyzer = {
    analyze(doc, html) {
        const found = new Set();
        const css = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ')
                  + [...doc.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join(' ')
                  + html;

        const hexReg = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
        let m;
        while ((m = hexReg.exec(css)) !== null) {
            const h = this.norm(m[0]);
            if (h) found.add(h);
        }

        const rgbReg = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
        while ((m = rgbReg.exec(css)) !== null) {
            const h = this.toHex(+m[1], +m[2], +m[3]);
            if (h) found.add(h);
        }

        const colors = [...found]
            .filter(c => !['#000000','#ffffff','#000','#fff'].includes(c))
            .slice(0, 32);

        return { colors, total: colors.length };
    },

    norm(hex) {
        hex = hex.toLowerCase();
        if (hex.length === 4) hex = '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
        return hex.length === 7 ? hex : null;
    },

    toHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255) return null;
        return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    },

    toRgb(hex) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgb(${r}, ${g}, ${b})`;
    }
};
