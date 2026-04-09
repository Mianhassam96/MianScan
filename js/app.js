document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const scanBtn  = document.getElementById('scanBtn');
  const progWrap = document.getElementById('progressWrap');
  const progBar  = document.getElementById('progressBar');
  const progLbl  = document.getElementById('progressLabel');
  const results  = document.getElementById('results');

  // ── Theme ──
  if (localStorage.getItem('ms_theme') === 'light') {
    document.body.classList.add('light');
    document.querySelector('#themeBtn i').className = 'bi bi-sun-fill';
  }
  document.getElementById('themeBtn').addEventListener('click', () => {
    document.body.classList.toggle('light');
    const light = document.body.classList.contains('light');
    localStorage.setItem('ms_theme', light ? 'light' : 'dark');
    document.querySelector('#themeBtn i').className = light ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  });

  // ── Example buttons ──
  document.querySelectorAll('.ex').forEach(btn =>
    btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(); })
  );

  // ── Scan triggers ──
  scanBtn.addEventListener('click', run);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });

  // ── Tab switching ──
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn || !Scanner.currentData) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    UI.renderTab(btn.dataset.tab, Scanner.currentData);
  });

  // ── Export ──
  document.getElementById('btnJSON').addEventListener('click', () => Scanner.currentData && Exporter.toJSON(Scanner.currentData));
  document.getElementById('btnPDF').addEventListener('click',  () => Scanner.currentData && Exporter.toPDF(Scanner.currentData));
  document.getElementById('btnCopy').addEventListener('click', () => Scanner.currentData && Exporter.copyReport(Scanner.currentData));

  // ── Main scan function ──
  async function run() {
    let url = urlInput.value.trim();
    if (!url) { UI.toast('Enter a URL first'); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    try { new URL(url); } catch { UI.toast('Invalid URL'); return; }
    urlInput.value = url;

    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="bi bi-radar spin"></i> Scanning...';
    progWrap.classList.remove('hidden');
    results.classList.add('hidden');
    progBar.style.width = '0%';

    try {
      const data = await Scanner.scan(url, (msg, pct) => {
        progBar.style.width = pct + '%';
        progLbl.textContent = msg;
      });

      results.classList.remove('hidden');
      UI.renderOverview(data);

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="overview"]').classList.add('active');
      UI.renderTab('overview', data);

      results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      UI.toast('Scan failed: ' + err.message);
      console.error(err);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i> Analyze';
      setTimeout(() => progWrap.classList.add('hidden'), 900);
    }
  }
});
