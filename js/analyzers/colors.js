/* global ColorAnalyzer */
const ColorAnalyzer = {
  analyze(doc, html) {
    const src = [...doc.querySelectorAll('style')].map(s => s.textContent).join(' ')
              + [...doc.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join(' ')
              + html;
    const found = new Set();
    let m;
    const hex3 = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
    while ((m = hex3.exec(src))) { const h = this._norm(m[0]); if (h) found.add(h); }
    const rgb = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
    while ((m = rgb.exec(src))) { const h = this._toHex(+m[1],+m[2],+m[3]); if (h) found.add(h); }
    const colors = [...found].filter(c => !['#000000','#ffffff'].includes(c)).slice(0, 32);
    return { colors, total: colors.length };
  },
  _norm(h) {
    h = h.toLowerCase();
    if (h.length === 4) h = '#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    return h.length === 7 ? h : null;
  },
  _toHex(r,g,b) {
    if (r>255||g>255||b>255) return null;
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  },
  toRgb(hex) {
    return `rgb(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)})`;
  }
};
