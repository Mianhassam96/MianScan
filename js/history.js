/* ── Scan History — stores last 8 scanned URLs in localStorage ── */
const History = {
  KEY: 'ms_history',
  MAX: 8,

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  add(url, seoScore) {
    let list = this.get().filter(h => h.url !== url); // dedupe
    list.unshift({ url, seoScore: seoScore ?? null, ts: Date.now() });
    list = list.slice(0, this.MAX);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  clear() {
    localStorage.removeItem(this.KEY);
    const el = document.getElementById('scanHistory');
    if (el) el.innerHTML = '';
  }
};
