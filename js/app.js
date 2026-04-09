document.addEventListener('DOMContentLoaded', () => {
  const urlInput    = document.getElementById('urlInput');
  const scanBtn     = document.getElementById('scanBtn');
  const progBox     = document.getElementById('progressBox');
  const progBar     = document.getElementById('progBar');
  const progLbl     = document.getElementById('progLabel');
  const results     = document.getElementById('results');
  const heroSection = document.getElementById('heroSection');
  const cmpSection  = document.getElementById('compareSection');
  const cmpResults  = document.getElementById('compareResults');
  const html        = document.documentElement;

  /* ── Theme ── */
  const saved = localStorage.getItem('ms_theme') || 'dark';
  html.setAttribute('data-theme', saved);
  document.querySelector('#themeBtn i').className = saved==='light'?'bi bi-sun-fill':'bi bi-moon-stars-fill';

  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = html.getAttribute('data-theme')==='dark'?'light':'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ms_theme', next);
    document.querySelector('#themeBtn i').className = next==='light'?'bi bi-sun-fill':'bi bi-moon-stars-fill';
  });

  /* ── Compare toggle ── */
  let compareMode = false;
  document.getElementById('compareToggle').addEventListener('click', () => {
    compareMode = !compareMode;
    heroSection.classList.toggle('hidden', compareMode);
    cmpSection.classList.toggle('hidden', !compareMode);
    results.classList.add('hidden');
    cmpResults.classList.add('hidden');
    document.getElementById('compareToggle').style.color = compareMode ? 'var(--primary2)' : '';
  });

  /* ── Compare scan ── */
  document.getElementById('compareBtn').addEventListener('click', async () => {
    let urlA = document.getElementById('urlA').value.trim();
    let urlB = document.getElementById('urlB').value.trim();
    if (!urlA || !urlB) { UI.toast('Enter both URLs'); return; }
    if (!urlA.startsWith('http')) urlA = 'https://' + urlA;
    if (!urlB.startsWith('http')) urlB = 'https://' + urlB;
    document.getElementById('compareBtn').disabled = true;
    document.getElementById('compareBtn').innerHTML = '<i class="bi bi-radar spin"></i><span>Comparing…</span>';
    cmpResults.classList.add('hidden');
    try {
      await Compare.run(urlA, urlB);
      cmpResults.classList.remove('hidden');
      cmpResults.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch(e) {
      UI.toast('Compare failed: ' + e.message);
    } finally {
      document.getElementById('compareBtn').disabled = false;
      document.getElementById('compareBtn').innerHTML = '<i class="bi bi-arrow-left-right"></i><span>Compare Sites</span>';
    }
  });

  /* ── Try buttons ── */
  document.querySelectorAll('.try-btn').forEach(btn =>
    btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(); })
  );

  /* ── Single scan ── */
  scanBtn.addEventListener('click', run);
  urlInput.addEventListener('keydown', e => { if (e.key==='Enter') run(); });

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
  document.getElementById('btnCSS').addEventListener('click',  () => Scanner.currentData && Exporter.downloadCSS(Scanner.currentData.colors.colors));
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

      results.scrollIntoView({ behavior:'smooth', block:'start' });

    } catch(err) {
      UI.toast('Scan failed: ' + err.message);
      console.error(err);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i><span>Analyze</span>';
      setTimeout(() => progBox.classList.add('hidden'), 1000);
    }
  }
});
