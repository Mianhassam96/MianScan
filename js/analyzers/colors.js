/* global ColorAnalyzer */
const ColorAnalyzer = {
  analyze(doc, html) {
    // Only extract from style tags and inline styles — skip script content
    const styleSrc = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ')
                   + [...doc.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join(' ');

    const freq = new Map();
    let m;

    const hex3 = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
    while ((m = hex3.exec(styleSrc))) {
      const h = this._norm(m[0]);
      if (h) freq.set(h, (freq.get(h) || 0) + 1);
    }
    const rgb = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
    while ((m = rgb.exec(styleSrc))) {
      const h = this._toHex(+m[1], +m[2], +m[3]);
      if (h) freq.set(h, (freq.get(h) || 0) + 1);
    }

    // Filter pure black/white
    freq.delete('#000000');
    freq.delete('#ffffff');

    // Filter near-white and near-black unless they appear 3+ times
    const filtered = [...freq.entries()].filter(([hex, count]) => {
      const [r, g, b] = this._hexToRgb(hex);
      const isNearWhite = r > 230 && g > 230 && b > 230;
      const isNearBlack = r < 40 && g < 40 && b < 40;
      if ((isNearWhite || isNearBlack) && count < 3) return false;
      return true;
    });

    // Sort by frequency descending
    filtered.sort((a, b) => b[1] - a[1]);

    // Deduplicate by RGB distance (skip colors too similar to already-picked ones)
    const picked = [];
    for (const [hex] of filtered) {
      if (picked.length >= 24) break;
      const [r1, g1, b1] = this._hexToRgb(hex);
      const tooClose = picked.some(p => {
        const [r2, g2, b2] = this._hexToRgb(p);
        return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 20;
      });
      if (!tooClose) picked.push(hex);
    }

    return { colors: picked, total: picked.length };
  },

  _norm(h) {
    h = h.toLowerCase();
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return h.length === 7 ? h : null;
  },

  _toHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) return null;
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  },

  _hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  },

  toRgb(hex) {
    const [r, g, b] = this._hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  },

  getContrastRatio(hex1, hex2) {
    const lum = hex => {
      const [r, g, b] = this._hexToRgb(hex).map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const l1 = lum(hex1), l2 = lum(hex2);
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    return +((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }
};
