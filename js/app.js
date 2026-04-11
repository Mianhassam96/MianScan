document.addEventListener('DOMContentLoaded', () => {
  const urlInput   = document.getElementById('urlInput');
  const scanBtn    = document.getElementById('scanBtn');
  const progBox    = document.getElementById('progressBox');
  const progBar    = document.getElementById('progBar');
  const progLbl    = document.getElementById('progLabel');
  const results    = document.getElementById('results');
  const cmpSection = document.getElementById('compareSection');
  const cmpResults = document.getElementById('compareResults');
  const htmlEl     = document.documentElement;
  const overlay    = document.getElementById('scanOverlay');
  const overlayMsg = document.getElementById('overlayMsg');
  const overlayUrl = document.getElementById('overlayUrl');
  const overlayFill= document.getElementById('overlayFill');
  const backToTop  = document.getElementById('backToTop');

  /* ── Feature cards → scroll to scanner + open tab ── */
  document.querySelectorAll('.feat-card[data-goto]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const tab = card.dataset.goto;
      // Scroll to scanner
      document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
      // If we have scan data, switch to that tab
      setTimeout(() => {
        if (Scanner.currentData) {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          const targetTab = document.querySelector(`[data-tab="${tab}"]`);
          if (targetTab) {
            targetTab.classList.add('active');
            UI.renderTab(tab, Scanner.currentData);
            // Scroll tab into view
            targetTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        } else {
          // No scan yet — focus URL input with a hint
          urlInput.focus();
          urlInput.placeholder = `Scan a site first, then see ${tab} data`;
          setTimeout(() => urlInput.placeholder = 'https://stripe.com', 3000);
        }
      }, 600);
    });
  });

  /* ── Smooth scroll for nav + footer links ── */
  document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Back to top ── */
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });

  /* ── Keyboard shortcut: / to focus URL ── */
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      urlInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* ── Theme ── */
  const saved = localStorage.getItem('ms_theme') || 'dark';
  htmlEl.setAttribute('data-theme', saved);
  document.querySelector('#themeBtn i').className = saved === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';

  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('ms_theme', next);
    document.querySelector('#themeBtn i').className = next === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  });

  /* ── Compare toggle ── */
  let compareMode = false;
  const compareToggle = document.getElementById('compareToggle');

  compareToggle.addEventListener('click', () => {
    compareMode = !compareMode;
    // Show/hide compare section inside scanner-app
    cmpSection.classList.toggle('hidden', !compareMode);
    // If switching to compare, hide single results
    if (compareMode) {
      results.classList.add('hidden');
      cmpResults.classList.add('hidden');
      // Scroll to scanner app
      document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    compareToggle.classList.toggle('active-btn', compareMode);
    compareToggle.title = compareMode ? 'Back to Single Scan' : 'Compare Mode';
  });

  /* ── Compare scan ── */
  document.getElementById('compareBtn').addEventListener('click', async () => {
    let urlA = document.getElementById('urlA').value.trim();
    let urlB = document.getElementById('urlB').value.trim();
    if (!urlA || !urlB) { UI.toast('Enter both URLs to compare'); return; }
    if (!urlA.startsWith('http')) urlA = 'https://' + urlA;
    if (!urlB.startsWith('http')) urlB = 'https://' + urlB;

    const btn = document.getElementById('compareBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-radar spin"></i><span>Comparing…</span>';
    cmpResults.classList.add('hidden');

    try {
      await Compare.run(urlA, urlB);
      cmpResults.classList.remove('hidden');
      cmpResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      UI.toast('Compare failed: ' + e.message);
      console.error(e);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-arrow-left-right"></i><span>Compare Sites</span>';
    }
  });

  /* ── Try buttons ── */
  document.querySelectorAll('.try-btn').forEach(btn =>
    btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(); })
  );

  /* ── Single scan ── */
  scanBtn.addEventListener('click', run);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });

  /* ── Tabs ── */
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn || !Scanner.currentData) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    UI.renderTab(btn.dataset.tab, Scanner.currentData);

    // Wire compare button after tab renders
    if (btn.dataset.tab === 'compare') {
      setTimeout(() => {
        const cmpBtn = document.getElementById('cmpRunBtn');
        if (cmpBtn && !cmpBtn._wired) {
          cmpBtn._wired = true;
          cmpBtn.addEventListener('click', async () => {
            let urlA = document.getElementById('cmpUrlA').value.trim();
            let urlB = document.getElementById('cmpUrlB').value.trim();
            if (!urlA || !urlB) { UI.toast('Enter both URLs'); return; }
            if (!urlA.startsWith('http')) urlA = 'https://' + urlA;
            if (!urlB.startsWith('http')) urlB = 'https://' + urlB;
            const bar = document.getElementById('cmpBar');
            const lbl = document.getElementById('cmpLabel');
            const prog = document.getElementById('cmpProgress');
            const out  = document.getElementById('cmpOutput');
            cmpBtn.disabled = true;
            cmpBtn.innerHTML = '<i class="bi bi-radar spin"></i><span>Comparing…</span>';
            prog.classList.remove('hidden');
            out.innerHTML = '';
            bar.style.width = '0%';
            try {
              await Compare.runInline(urlA, urlB, bar, lbl, out);
            } catch(e) {
              UI.toast('Compare failed: ' + e.message);
            } finally {
              cmpBtn.disabled = false;
              cmpBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i><span>Compare Sites</span>';
              setTimeout(() => prog.classList.add('hidden'), 800);
            }
          });
        }
      }, 100);
    }
  });

  /* ── Export ── */
  document.getElementById('btnJSON').addEventListener('click', () => Scanner.currentData && Exporter.toJSON(Scanner.currentData));
  document.getElementById('btnPDF').addEventListener('click',  () => Scanner.currentData && Exporter.toPDF(Scanner.currentData));
  document.getElementById('btnCSV').addEventListener('click',  () => Scanner.currentData && Exporter.toCSV(Scanner.currentData));
  document.getElementById('btnCSS').addEventListener('click',  () => Scanner.currentData && Exporter.downloadCSS(Scanner.currentData.colors.colors));
  document.getElementById('btnCopy').addEventListener('click', () => Scanner.currentData && Exporter.copyReport(Scanner.currentData));

  /* ── Scan Again ── */
  document.getElementById('scanAgainBtn').addEventListener('click', () => {
    results.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => urlInput.focus(), 600);
  });

  /* ── Tab scroll arrows ── */
  const tabsBar = document.getElementById('tabsBar');
  document.getElementById('tabScrollLeft').addEventListener('click', () => {
    tabsBar.scrollBy({ left: -200, behavior: 'smooth' });
  });
  document.getElementById('tabScrollRight').addEventListener('click', () => {
    tabsBar.scrollBy({ left: 200, behavior: 'smooth' });
  });

  /* ── Main scan ── */
  async function run() {
    let url = urlInput.value.trim();
    if (!url) { UI.toast('Enter a URL first'); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    try { new URL(url); } catch { UI.toast('Invalid URL'); return; }
    urlInput.value = url;

    // Hide compare mode if active
    if (compareMode) {
      compareMode = false;
      cmpSection.classList.add('hidden');
      compareToggle.classList.remove('active-btn');
    }

    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="bi bi-radar spin"></i><span>Scanning…</span>';
    progBox.classList.remove('hidden');
    results.classList.add('hidden');
    progBar.style.width = '0%';
    // Show overlay
    overlayUrl.textContent = url;
    overlayMsg.textContent = 'Initializing scan…';
    overlayFill.style.width = '0%';
    overlay.classList.add('active');

    try {
      const data = await Scanner.scan(url, (msg, pct) => {
        progBar.style.width = pct + '%';
        progLbl.textContent = msg;
        overlayMsg.textContent = msg;
        overlayFill.style.width = pct + '%';
      });

      overlay.classList.remove('active');
      results.classList.remove('hidden');
      UI.renderBanner(data);
      UI.renderStats(data);

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="overview"]').classList.add('active');
      UI.renderTab('overview', data);

      document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      overlay.classList.remove('active');
      // Better error messages
      let msg = err.message;
      if (/timeout|abort/i.test(msg))       msg = 'The site took too long to respond. Try again.';
      else if (/proxies failed/i.test(msg)) msg = 'This site blocks external requests. Try a different URL.';
      else if (/empty response/i.test(msg)) msg = 'No content returned. The site may require login.';
      UI.toast('Scan failed: ' + msg);
      console.error(err);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i><span>Analyze</span>';
      setTimeout(() => progBox.classList.add('hidden'), 1000);
    }
  }
});

/* ── Scroll Reveal ── */
(function initScrollReveal() {
  const els = document.querySelectorAll(
    '.feat-card, .step-card, .who-card, .testi-card, .lp-section-head, .compare-mock, .lp-cta-inner'
  );
  els.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings in the same grid
    const delay = (i % 4) * 0.08;
    el.style.transitionDelay = delay + 's';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

/* ── Animated stat counter on results render ── */
function animateCounters() {
  document.querySelectorAll('.stat-val[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const isFloat = el.dataset.count.includes('.');
    const duration = 900;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = from + (target - from) * ease;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// Expose so UI.js can call it after rendering stats
window.animateCounters = animateCounters;
