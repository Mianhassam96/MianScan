document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const scanBtn  = document.getElementById('scanBtn');
  const progBox  = document.getElementById('progressBox');
  const progBar  = document.getElementById('progBar');
  const progLbl  = document.getElementById('progLabel');
  const results  = document.getElementById('results');
  const html     = document.documentElement;

  /* ── Theme ── */
  const saved = localStorage.getItem('ms_theme') || 'dark';
  html.setAttribute('data-theme', saved);
  document.querySelector('#themeBtn i').className = saved === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';

  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ms_theme', next);
    document.querySelector('#themeBtn i').className = next === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  });

  /* ── Try buttons ── */
  document.querySelectorAll('.try-btn').forEach(btn =>
    btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(); })
  );

  /* ── Scan ── */
  scanBtn.addEventListener('click', run);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });

  /* ── Tabs ── */
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn || !Scanner.currentData) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    UI.renderTab(btn.dataset.tab, Scanner.currentData);
  });

  /* ── Export ── */
  document.getElementById('btnJSON').addEventListener('click', () => Scanner.currentData && Exporter.toJSON(Scanner.currentData));
  document.getElementById('btnPDF').addEventListener('click',  () => Scanner.currentData && Exporter.toPDF(Scanner.currentData));
  document.getElementById('btnCopy').addEventListener('click', () => Scanner.currentData && Exporter.copyReport(Scanner.currentData));

  async function run() {
    let url = urlInput.value.trim();
    if (!url) { UI.toast('Enter a URL first'); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    try { new URL(url); } catch { UI.toast('Invalid URL'); return; }
    urlInput.value = url;

    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="bi bi-radar spin"></i><span>Scanning…</span>';
    progBox.classList.remove('hidden');
    results.classList.add('hidden');
    progBar.style.width = '0%';

    try {
      const data = await Scanner.scan(url, (msg, pct) => {
        progBar.style.width = pct + '%';
        progLbl.textContent = msg;
      });

      results.classList.remove('hidden');
      UI.renderBanner(data);
      UI.renderStats(data);

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="overview"]').classList.add('active');
      UI.renderTab('overview', data);

      results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      UI.toast('Scan failed: ' + err.message);
      console.error(err);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i><span>Analyze</span>';
      setTimeout(() => progBox.classList.add('hidden'), 1000);
    }
  }
});
