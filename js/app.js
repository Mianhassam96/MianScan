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

  // Cancel button in scan overlay — aborts active scan by reloading page state
  const overlayCancel = document.getElementById('overlayCancel');
  let _scanAbortController = null;
  if (overlayCancel) {
    overlayCancel.addEventListener('click', () => {
      overlay.classList.remove('active');
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i><span>Analyze</span>';
      progBox.classList.add('hidden');
      results.classList.add('hidden');
      document.getElementById('siteBanner').innerHTML  = '';
      document.getElementById('statsRow').innerHTML    = '';
      document.getElementById('tabContent').innerHTML  = '';
      UI.toast('Scan cancelled');
    });
  }

  /* ── Hamburger menu ── */
  const hamburger = document.getElementById('navHamburger');
  const navMobile = document.getElementById('navMobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMobile.classList.toggle('open');
    });
    // Close on link click
    navMobile.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMobile.classList.remove('open');
      })
    );
  }

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
          setTimeout(() => urlInput.placeholder = 'https://multimian.com', 3000);
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

  /* ── Back to top + nav scroll glow ── */
  const topnav = document.querySelector('.topnav');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
    if (topnav) topnav.classList.toggle('scrolled', window.scrollY > 40);
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

  /* ── Compare toggle — now triggered from compare tab only ── */
  let compareMode = false;
  const compareToggle = document.getElementById('compareToggle');
  if (compareToggle) {
    compareToggle.addEventListener('click', () => {
      compareMode = !compareMode;
      cmpSection.classList.toggle('hidden', !compareMode);
      if (compareMode) {
        results.classList.add('hidden');
        cmpResults.classList.add('hidden');
        document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      compareToggle.classList.toggle('active-btn', compareMode);
      compareToggle.title = compareMode ? 'Back to Single Scan' : 'Compare Mode';
    });
  }

  /* ── Compare scan ── */
  document.getElementById('compareBtn').addEventListener('click', async () => {
    let urlA = document.getElementById('urlA').value.trim();
    let urlB = document.getElementById('urlB').value.trim();
    if (!urlA || !urlB) { UI.toast('Enter both URLs to compare'); return; }
    urlA = Scanner.normalizeUrl(urlA);
    urlB = Scanner.normalizeUrl(urlB);

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
    btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(btn.dataset.url); })
  );

  /* ── Single scan ── */
  scanBtn.addEventListener('click', () => run());
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  /* ── Tabs ── */
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn || !Scanner.currentData) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    UI.renderTab(btn.dataset.tab, Scanner.currentData);
  });

  /* ── Compare tab: event delegation on #tabContent (survives innerHTML re-renders) ── */
  document.getElementById('tabContent').addEventListener('click', async e => {
    const cmpBtn = e.target.closest('#cmpRunBtn');
    if (!cmpBtn) return;
    let urlA = document.getElementById('cmpUrlA').value.trim();
    let urlB = document.getElementById('cmpUrlB').value.trim();
    if (!urlA || !urlB) { UI.toast('Enter both URLs'); return; }
    urlA = Scanner.normalizeUrl(urlA);
    urlB = Scanner.normalizeUrl(urlB);
    const bar  = document.getElementById('cmpBar');
    const lbl  = document.getElementById('cmpLabel');
    const prog = document.getElementById('cmpProgress');
    const out  = document.getElementById('cmpOutput');
    cmpBtn.disabled = true;
    cmpBtn.innerHTML = '<i class="bi bi-radar spin"></i><span>Comparing…</span>';
    prog.classList.remove('hidden');
    out.innerHTML = '';
    bar.style.width = '0%';
    try {
      await Compare.runInline(urlA, urlB, bar, lbl, out);
    } catch (err) {
      UI.toast('Compare failed: ' + err.message);
    } finally {
      cmpBtn.disabled = false;
      cmpBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i><span>Compare Sites</span>';
      setTimeout(() => prog.classList.add('hidden'), 800);
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

  /* ── New Scan sticky bar ── */
  document.getElementById('newScanBtn').addEventListener('click', () => {
    results.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => urlInput.focus(), 600);
  });

  /* ── Rescan button (force fresh) ── */
  const rescanBtn = document.getElementById('rescanBtn');
  if (rescanBtn) {
    rescanBtn.addEventListener('click', () => {
      if (Scanner.currentData) run(Scanner.currentData.url, true);
    });
  }

  /* ── Share button — uses Exporter.toShareableLink() for compact encoded report ── */
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (Scanner.currentData) {
        Exporter.toShareableLink(Scanner.currentData);
      } else {
        navigator.clipboard.writeText(location.href).then(() => UI.toast('Link copied!'));
      }
    });
  }

  /* ── Tab scroll arrows ── */
  const tabsBar = document.getElementById('tabsBar');
  document.getElementById('tabScrollLeft').addEventListener('click', () => {
    tabsBar.scrollBy({ left: -200, behavior: 'smooth' });
  });
  document.getElementById('tabScrollRight').addEventListener('click', () => {
    tabsBar.scrollBy({ left: 200, behavior: 'smooth' });
  });

  /* ── Main scan ── */
  async function run(urlOverride, forceRescan = false) {
    let url = (urlOverride || urlInput.value).trim();
    if (!url) { UI.toast('Enter a URL first'); return; }
    url = Scanner.normalizeUrl(url);
    try { new URL(url); } catch { UI.toast('Invalid URL'); return; }
    urlInput.value = url;

    // Update browser URL
    const shareParam = new URL(location.href);
    shareParam.searchParams.set('url', url);
    window.history.replaceState(null, '', shareParam.toString());

    // ── Cache hit — instant load
    if (!forceRescan) {
      const cached = Scanner.cacheGet(url);
      if (cached) {
        Scanner.currentData = cached;
        const age = Math.round((Date.now() - new Date(cached.scannedAt).getTime()) / 60000);
        _showResults(cached);
        UI.toast(`Loaded from cache · ${age}m ago · click ↺ to rescan`);
        return;
      }
    }

    // Hide compare mode if active
    if (compareMode) {
      compareMode = false;
      cmpSection.classList.add('hidden');
      const ct = document.getElementById('compareToggle');
      if (ct) ct.classList.remove('active-btn');
    }

    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="bi bi-radar spin"></i><span>Scanning…</span>';
    progBox.classList.remove('hidden');
    progBar.style.width = '0%';
    overlayUrl.textContent = url;
    overlayMsg.textContent = 'Initializing scan…';
    overlayFill.style.width = '0%';
    overlay.classList.add('active');

    // Show skeleton
    results.classList.remove('hidden');
    document.getElementById('siteBanner').innerHTML = `<div class="skeleton-wrap"><div class="skeleton skeleton-banner"></div></div>`;
    document.getElementById('statsRow').innerHTML = `<div class="skeleton-stats">${Array(8).fill('<div class="skeleton skeleton-stat"></div>').join('')}</div>`;
    document.getElementById('tabContent').innerHTML = `<div class="skeleton-wrap"><div class="skeleton skeleton-tabs"></div><div class="skeleton-grid"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div></div>`;

    try {
      const data = await Scanner.scan(url, (msg, pct) => {
        progBar.style.width = pct + '%';
        progLbl.textContent = msg;
        overlayMsg.textContent = msg;
        overlayFill.style.width = pct + '%';
      });
      overlay.classList.remove('active');
      _showResults(data);

    } catch (err) {
      overlay.classList.remove('active');

      // Typed error messages — each maps to a real cause
      const code = err.code || '';
      let icon = '⚠️';
      let headline = 'Scan Failed';
      let msg, hint;

      if (code === Scanner.ERR_TIMEOUT) {
        icon = '⏱️';
        headline = 'Website took too long to respond';
        msg = 'The target server didn\'t reply within MianScan\'s scan window.';
        hint = 'The site may be slow, down, or blocking automated requests.';
      } else if (code === Scanner.ERR_BLOCKED) {
        icon = '🚫';
        headline = 'Website rejected the scan request';
        msg = 'This site actively blocks automated requests (Cloudflare protection, login wall, or bot detection).';
        hint = 'Try a different URL, or check that the site is publicly accessible.';
      } else if (code === Scanner.ERR_EMPTY) {
        icon = '📭';
        headline = 'No content returned';
        msg = 'The page returned an empty response. It may require JavaScript to render or a login to access.';
        hint = 'MianScan works on publicly accessible, server-rendered pages.';
      } else if (code === Scanner.ERR_SCANNER) {
        icon = '🔧';
        headline = 'Scanning proxy temporarily unavailable';
        msg = 'All fetch proxies are currently rate-limited or down. This is a temporary infrastructure issue — not a problem with the URL you entered.';
        hint = 'Wait 30 seconds and retry. The scanner will recover automatically when the proxies come back online.';
      } else {
        // Generic fallback — include raw message for debugging
        msg = err.message || 'An unexpected error occurred.';
        hint = 'Try a different URL or try again shortly.';
      }

      results.classList.remove('hidden');
      document.getElementById('siteBanner').innerHTML = `
        <div class="scan-error-state">
          <div class="scan-error-icon">${icon}</div>
          <div class="scan-error-headline">${headline}</div>
          <div class="scan-error-msg">${msg}</div>
          ${hint ? `<div class="scan-error-hint">${hint}</div>` : ''}
          <div class="scan-error-actions">
            <button class="scan-btn scan-error-retry" data-retry-url="${url.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" onclick="_run(this.dataset.retryUrl, true)">
              <i class="bi bi-arrow-repeat"></i><span>Retry</span>
            </button>
            <button class="exp-btn scan-error-other" onclick="document.getElementById('scanAgainBtn').click()">
              <i class="bi bi-search"></i> Try Another URL
            </button>
          </div>
        </div>`;
      document.getElementById('statsRow').innerHTML = '';
      document.getElementById('tabContent').innerHTML = '';
      document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.error('[MianScan]', code || 'UNKNOWN', err.details || err.message);
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i class="bi bi-radar"></i><span>Analyze</span>';
      setTimeout(() => progBox.classList.add('hidden'), 1000);
    }
  }

  function _showResults(data) {
    document.getElementById('siteBanner').innerHTML = '';
    document.getElementById('statsRow').innerHTML = '';
    document.getElementById('tabContent').innerHTML = '';
    results.classList.remove('hidden');
    UI.renderBanner(data);
    UI.renderStats(data);
    const newScanUrl = document.getElementById('newScanUrl');
    if (newScanUrl) newScanUrl.textContent = new URL(data.url).hostname;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="growth"]').classList.add('active');
    UI.renderTab('growth', data);
    document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Auto-scan from ?url= query param ──
  const autoUrl = new URLSearchParams(location.search).get('url');
  if (autoUrl) {
    urlInput.value = autoUrl;
    setTimeout(() => run(autoUrl), 400);
  }

  // ── Load shared report from #report= hash ──
  if (location.hash.startsWith('#report=')) {
    Exporter.loadFromHash().then(summary => {
      if (!summary) return;
      // Show the shared report summary in the results area
      results.classList.remove('hidden');
      const hostname = new URL(summary.u).hostname.replace(/^www\./, '');
      document.getElementById('siteBanner').innerHTML = `
        <div class="shared-report-banner">
          <div class="shared-report-badge"><i class="bi bi-share-fill"></i> Shared Report</div>
          <div class="shared-report-title">${UI.e(summary.ov?.title || hostname)}</div>
          <div class="shared-report-url"><i class="bi bi-globe2"></i> ${UI.e(hostname)}</div>
          <div class="shared-report-meta">
            <span><i class="bi bi-clock"></i> Scanned ${new Date(summary.at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</span>
            <span style="color:var(--muted);font-size:.75rem">This is a shared snapshot — scan the site again for fresh results.</span>
          </div>
        </div>`;
      // Show summary stats
      if (summary.g) {
        const g = summary.g;
        const sc = s => s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--primary2)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
        const catCards = Object.entries(g.cats || {}).map(([k,v]) => {
          const labels = {seo:'SEO',performance:'Performance',mobile:'Mobile',security:'Security',
                          conversion:'Conversion',business:'Business',content:'Content',ux:'UX',accessibility:'Accessibility'};
          return `<div class="stat-card"><div class="stat-icon" style="font-size:.8rem">${labels[k]||k}</div><div class="stat-val" style="color:${sc(v)}">${v}</div></div>`;
        }).join('');
        document.getElementById('statsRow').innerHTML = `
          <div class="stat-card stat-card-growth" style="order:-1">
            <div class="stat-icon">🚀</div>
            <div class="stat-val" style="color:${sc(g.s)}">${g.s}</div>
            <div class="stat-lbl">Growth Score</div>
          </div>
          ${catCards}`;
      }
      // Show tab content — render shared summary
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      const growthTab = document.querySelector('[data-tab="growth"]');
      if (growthTab) {
        growthTab.classList.add('active');
        document.getElementById('tabContent').innerHTML = `<div class="fu">${_renderSharedGrowth(summary)}</div>`;
      }
      document.getElementById('scanner-app').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(() => {});
  }

  function _renderSharedGrowth(s) {
    if (!s.g) return UI.empty('No Growth Score data in this shared report.');
    const g   = s.g;
    const sc  = v => v >= 80 ? 'var(--green)' : v >= 65 ? 'var(--primary2)' : v >= 50 ? 'var(--yellow)' : 'var(--red)';
    const col = sc(g.s);
    const issues = (g.top || []).map(f => {
      const pm = { critical:'var(--red)', high:'#f59e0b', medium:'var(--primary2)', low:'var(--muted)' };
      return `<div class="p2-finding" style="border-color:rgba(37,99,235,.2);margin-bottom:.5rem">
        <div class="p2-finding-head">
          <span class="p2-finding-cat" style="background:rgba(37,99,235,.1);color:${pm[f.p]||'var(--muted)'};border-color:rgba(37,99,235,.2)">${f.cat}</span>
          <span class="p2-finding-title">${UI.e(f.t)}</span>
          ${f.e ? `<span class="p2-finding-effort">${UI.e(f.e)}</span>` : ''}
        </div>
      </div>`;
    }).join('');
    return `
    <div class="shared-report-notice">
      <i class="bi bi-info-circle-fill"></i>
      This is a shared snapshot of a previous scan. <a href="?url=${encodeURIComponent(s.u)}" style="color:var(--primary2)">Run a fresh scan →</a>
    </div>
    <div class="p2-hero">
      <div class="p2-hero-ring-col">
        <div class="p2-score-ring" style="border-color:${col};color:${col};box-shadow:0 0 48px ${col}28">
          <span class="p2-score-val">${g.s}</span>
          <span class="p2-score-sub">/ 100</span>
        </div>
        <div class="p2-score-grade" style="color:${col}">${g.lb || ''}</div>
        <div class="p2-score-grade-letter" style="background:${col}18;color:${col}">Grade ${g.gr}</div>
      </div>
      <div class="p2-hero-body">
        <div class="p2-hero-headline"><i class="bi bi-graph-up-arrow" style="color:${col}"></i> Growth Score</div>
        <div class="p2-hero-domain">${UI.e(new URL(s.u).hostname.replace(/^www\./,''))}</div>
        <div class="p2-hero-summary">${UI.e(g.sm || '')}</div>
      </div>
    </div>
    ${issues ? `<div class="card"><div class="card-head"><i class="bi bi-clipboard2-pulse-fill"></i> Top Priority Issues</div>${issues}</div>` : ''}`;
  }

  // ── Scanner health check ─────────────────────────────────────────────────
  // Pings the actual Wave 1 proxies to reflect real scanner status.
  // Tests 0xhorizon (primary Wave 1) and cors.lol in parallel — if either
  // responds, the scanner is operational. Shows degraded if both fail.
  (async function checkHealth() {
    const badge = document.getElementById('scannerStatusBadge');
    if (!badge) return;

    badge.innerHTML = `<i class="bi bi-circle-fill" style="font-size:.5rem;opacity:.6"></i> Checking…`;
    badge.style.color = 'var(--muted)';

    const testProxy = async (url) => {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      const res  = await fetch(url, { signal: ctrl.signal });
      const text = await res.text();
      return res.ok && text.length > 100;
    };

    try {
      const testUrl = encodeURIComponent('https://example.com');
      const [w1, w2] = await Promise.allSettled([
        testProxy(`https://cors-anywhere.0xhorizon.workers.dev/https://example.com`),
        testProxy(`https://api.cors.lol/?url=${testUrl}`),
      ]);

      const anyOk = (w1.status === 'fulfilled' && w1.value) ||
                    (w2.status === 'fulfilled' && w2.value);
      const workerReady = Scanner._workerReady();

      if (anyOk || workerReady) {
        badge.innerHTML = `<i class="bi bi-circle-fill" style="font-size:.5rem"></i> Scanner Ready`;
        badge.style.color = 'var(--green)';
      } else {
        badge.innerHTML = `<i class="bi bi-circle-fill" style="font-size:.5rem"></i> Limited`;
        badge.style.color = 'var(--yellow)';
      }
    } catch (_) {
      badge.innerHTML = `<i class="bi bi-circle-fill" style="font-size:.5rem"></i> Limited — deploy Worker for best results`;
      badge.style.color = 'var(--yellow)';
    }
  })();

  // Expose run globally for inline onclick retry buttons
  window._run = (url, force) => run(url, force);
});

/* ── Animated hero mock counter ── */
(function animateHeroMock() {
  const el = document.querySelector('.mock-stat-val[style*="22c55e"]');
  if (!el) return;
  const target = 92;
  let current = 0;
  const step = () => {
    current = Math.min(current + 2, target);
    el.textContent = current;
    if (current < target) requestAnimationFrame(step);
  };
  // Start when hero is visible
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { requestAnimationFrame(step); io.disconnect(); }
  }, { threshold: 0.5 });
  const hero = document.querySelector('.lp-hero');
  if (hero) io.observe(hero);
})();

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
