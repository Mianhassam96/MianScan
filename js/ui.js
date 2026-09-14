const UI = {
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  },

  e(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  copyBtn(val, label='Copy') {
    const safe = String(val).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<button class="copy-btn" onclick="UI.copy('${safe}')"><i class="bi bi-clipboard"></i>${label}</button>`;
  },
  irow(l,v){ return `<div class="irow"><span class="ilbl">${l}</span><span class="ival">${v}</span></div>`; },
  crow(l,pass){ return `<div class="crow"><span class="clbl">${l}</span><span class="${pass?'pass':'fail'}"><i class="bi bi-${pass?'check-circle-fill':'x-circle-fill'}"></i>${pass?'Pass':'Fail'}</span></div>`; },
  empty(m){ return `<div class="empty"><i class="bi bi-inbox"></i><p>${m}</p></div>`; },
  miss(v){ return v?this.e(v):'<em style="color:var(--red);font-style:normal">Missing</em>'; },
  none(v){ return v?this.e(v):'<em style="color:var(--muted);font-style:normal">None</em>'; },
  warnRow(w){
    const icon=w.type==='ok'?'check-circle-fill':w.type==='warn'?'exclamation-triangle-fill':'x-circle-fill';
    const cls=w.type==='ok'?'a11y-ok':'a11y-warn';
    return `<div class="a11y-row ${cls}"><i class="bi bi-${icon}"></i>${this.e(w.msg)}</div>`;
  },

  renderBanner(data) {
    const o = data.overview;
    const hostname = new URL(data.url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    const scannedTime = new Date(data.scannedAt).toLocaleString();
    const shareUrl = `${location.origin}${location.pathname}?url=${encodeURIComponent(data.url)}`;
    const r = data.content?.readability || {};
    const readColor = r.score >= 70 ? 'var(--green)' : r.score >= 50 ? 'var(--yellow)' : 'var(--red)';

    // OG social preview
    const ogPreview = (data.seo.ogTitle || data.seo.ogImage) ? `
      <div class="og-preview">
        ${data.seo.ogImage ? `<img class="og-img" src="${this.e(data.seo.ogImage)}" alt="OG Image" onerror="this.parentElement.style.display='none'">` : ''}
        <div class="og-text">
          <div class="og-label">Open Graph Preview</div>
          <div class="og-title">${this.e(data.seo.ogTitle || o.title)}</div>
          <div class="og-desc">${this.e(data.seo.metaDesc || o.desc || '')}</div>
          <div class="og-domain">${this.e(hostname)}</div>
        </div>
      </div>` : '';

    document.getElementById('siteBanner').innerHTML = `
      <div class="sb-favicon-wrap">
        <img class="sb-favicon" src="${faviconUrl}" alt="${hostname}" onerror="this.style.display='none'">
        <div class="sb-info">
          <div class="sb-title">${this.e(o.title)}</div>
          <div class="sb-url">
            <a href="${this.e(data.url)}" target="_blank" rel="noopener">
              <i class="bi bi-box-arrow-up-right"></i> ${this.e(hostname)}
            </a>
            <span class="sb-scan-time"><i class="bi bi-clock"></i> ${scannedTime}</span>
            ${r.label ? `<span class="sb-readability" style="color:${readColor}"><i class="bi bi-book-fill"></i> ${r.label} (${r.score})</span>` : ''}
          </div>
          <div class="sb-desc">${this.e(o.desc) || '<em style="opacity:.45">No description found</em>'}</div>
          <div class="sb-tags">
            <span class="sb-tag"><i class="bi bi-tag-fill"></i>${this.e(o.type)}</span>
            <span class="sb-tag"><i class="bi bi-translate"></i>${this.e(o.lang)}</span>
            <span class="sb-tag"><i class="bi bi-layout-split"></i>${o.sections} sections</span>
            <span class="sb-tag"><i class="bi bi-file-word"></i>${(data.content.wordCount || 0).toLocaleString()} words</span>
            <span class="sb-tag"><i class="bi bi-lightbulb-fill"></i>${this.e(o.topic)}</span>
          </div>
          <div class="sb-actions">
            <button class="exp-btn" data-share-url="${this.e(shareUrl)}" onclick="UI.shareUrl(this.dataset.shareUrl)"><i class="bi bi-share-fill"></i> Share</button>
            <button class="exp-btn" data-copy-url="${this.e(shareUrl)}" onclick="UI.copy(this.dataset.copyUrl)"><i class="bi bi-link-45deg"></i> Copy Link</button>
          </div>
        </div>
      </div>
      ${ogPreview}
      ${this._growthBannerStrip(data)}
      ${this._mmMicroCTA(data)}
      ${this._partialScanNotice(data)}`;
  },

  /* ── Growth score summary strip shown in site banner ── */
  _growthBannerStrip(data) {
    const g = data.growth;
    if (!g) return '';
    const color = g.overall >= 80 ? 'var(--green)' : g.overall >= 65 ? 'var(--primary2)' : g.overall >= 50 ? 'var(--yellow)' : 'var(--red)';
    const critCount = g.findings.filter(f => f.priority === 'critical').length;
    const highCount = g.findings.filter(f => f.priority === 'high').length;
    return `
    <div class="growth-banner-strip" onclick="document.querySelector('[data-tab=growth]').click()" title="View Growth Score details">
      <div style="text-align:center;flex-shrink:0">
        <div class="gbs-score" style="color:${color}">${g.overall}</div>
        <div class="gbs-label" style="color:${color}">Growth Score</div>
      </div>
      <div class="gbs-text">
        <div class="gbs-summary">${this.e(g.summary)}</div>
        <div class="gbs-badges">
          ${critCount > 0 ? `<span class="gbs-badge" style="background:rgba(240,68,68,.12);color:var(--red)">${critCount} Critical</span>` : ''}
          ${highCount > 0 ? `<span class="gbs-badge" style="background:rgba(245,158,11,.12);color:#f59e0b">${highCount} High Priority</span>` : ''}
          ${critCount === 0 && highCount === 0 ? `<span class="gbs-badge" style="background:rgba(34,197,94,.12);color:var(--green)">✓ No Critical Issues</span>` : ''}
          <span class="gbs-badge" style="background:rgba(34,197,94,.1);color:var(--green)">${g.findings.filter(f=>f.priority==='good').length} Passing</span>
        </div>
      </div>
      <div class="gbs-cta"><i class="bi bi-arrow-right-circle-fill"></i> View Full Report</div>
    </div>`;
  },

  /* ── MultiMian micro-CTA — shown in banner when issues found ── */
  _mmMicroCTA(data) {
    const g = data.growth;
    if (!g) return '';
    const critCount = g.findings.filter(f => f.priority === 'critical').length;
    const highCount = g.findings.filter(f => f.priority === 'high').length;
    const total     = critCount + highCount;
    if (total === 0) return '';

    const copy = critCount >= 3
      ? { msg: `${critCount} critical issues are directly blocking leads and search visibility.`, btn: 'Get a Free Growth Review →' }
      : critCount > 0
      ? { msg: `${critCount} critical + ${highCount} high-priority issue${total !== 1 ? 's' : ''} found. MultiMian can fix these for you.`, btn: 'Talk to MultiMian →' }
      : { msg: `${highCount} high-priority issue${highCount !== 1 ? 's' : ''} are limiting your website's performance.`, btn: 'See How MultiMian Helps →' };

    return `
    <div class="mm-micro-cta">
      <i class="bi bi-stars mm-micro-cta-icon"></i>
      <span class="mm-micro-cta-msg">${copy.msg}</span>
      <a href="https://multimian.com" target="_blank" rel="noopener" class="mm-micro-cta-btn">${copy.btn}</a>
    </div>`;
  },

  /* ── Partial scan notice — shown when one or more analyzers used fallback data ── */
  _partialScanNotice(data) {
    const f = data._fallbacks;
    if (!f || f.length === 0) return '';
    // Only show for non-external-only fallbacks (domain/ranking unavailability is expected)
    const significant = f.filter(n => !['Domain','Ranking','Indexing'].includes(n));
    if (significant.length === 0) return '';
    return `
    <div class="partial-scan-notice">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>Partial scan — ${significant.length} analyzer${significant.length > 1 ? 's' : ''} returned limited data:
        <strong>${significant.join(', ')}</strong>.
        Some results may be incomplete. Try rescanning.
      </span>
    </div>`;
  },
    const {colors,fonts,contacts,tech,seo,links,images,domain,ranking} = data;
    const da = domain?.da !== null && domain?.da !== undefined ? domain.da+'/10' : '—';
    const rank = ranking?.globalRank ? '#'+Number(ranking.globalRank).toLocaleString() : '—';
    const growth = data.growth;
    const growthVal   = growth ? growth.overall : '—';
    const growthColor = !growth ? 'var(--muted)'
      : growth.overall >= 80 ? 'var(--green)'
      : growth.overall >= 65 ? 'var(--primary2)'
      : growth.overall >= 50 ? 'var(--yellow)'
      : 'var(--red)';
    const cards = [
      {icon:'🚀', val:growthVal,               lbl:'Growth Score', color:growthColor,       count:growth?.overall, highlight:true},
      {icon:'📊', val:seo.score+'/100',         lbl:'SEO Score',    color:'var(--green)',    count:seo.score},
      {icon:'🏆', val:da,                       lbl:'Domain Auth',  color:'var(--primary2)'},
      {icon:'🌍', val:rank,                     lbl:'Global Rank',  color:'var(--accent)'},
      {icon:'⚡', val:(data.performance?.score??'—'),lbl:'Perf Score',color:data.performance?.score>=80?'var(--green)':data.performance?.score>=50?'var(--yellow)':'var(--red)',count:data.performance?.score},
      {icon:'🔗', val:links.totalInternal,      lbl:'Int. Links',   color:'var(--primary2)', count:links.totalInternal},
      {icon:'🌐', val:links.totalExternal,      lbl:'Ext. Links',   color:'var(--muted)',    count:links.totalExternal},
      {icon:'🛠️', val:tech.detected.length,    lbl:'Tech Found',   color:'var(--purple)',   count:tech.detected.length},
    ];
    document.getElementById('statsRow').innerHTML = cards.map((c,i)=>
      `<div class="stat-card fu${c.highlight?' stat-card-growth':''}" style="animation-delay:${i*.05}s${c.highlight?';order:-1':''}"${c.highlight?` onclick="document.querySelector('[data-tab=growth]').click()" title="View Growth Score"`:''}>
        <div class="stat-icon">${c.icon}</div>
        <div class="stat-val" style="color:${c.color}"${c.count!==undefined?` data-count="${c.count}"`:''}>${c.val}</div>
        <div class="stat-lbl">${c.lbl}</div>
      </div>`).join('');
    // Trigger counter animation
    if (typeof window.animateCounters === 'function') setTimeout(window.animateCounters, 80);
  },

  renderTab(tab, data) {
    // Compare tab — show inline compare UI
    if (tab === 'compare') {
      document.getElementById('tabContent').innerHTML = `<div class="fu">${this.tCompareUI()}</div>`;
      return;
    }
    const map = {
      growth:      ()=>this.tGrowth(data),
      overview:    ()=>this.tOverview(data),
      seo:         ()=>this.tSEO(data.seo),
      domain:      ()=>this.tDomain(data.domain, data.seo, data.overview),
      ranking:     ()=>this.tRanking(data.ranking, data.domain),
      keywords:    ()=>this.tKeywords(data.content),
      headings:    ()=>this.tHeadings(data.seo),
      links:       ()=>this.tLinks(data.links),
      images:      ()=>this.tImages(data.images),
      contacts:    ()=>this.tContacts(data.contacts),
      cta:         ()=>this.tCTA(data.cta),
      conversion:  ()=>this.tConversion(data),
      business:    ()=>this.tBusiness(data),
      tech:        ()=>this.tTech(data.tech),
      performance: ()=>this.tPerf(data.performance),
      metatags:    ()=>this.tMetaTags(data.seo),
      indexing:    ()=>this.tIndexing(data.indexing),
      security:    ()=>this.tSecurity(data.security, data.url),
      mobile:      ()=>this.tMobile(data.mobile),
      social:      ()=>this.tSocial(data.seo, data.contacts),
      colors:      ()=>this.tColors(data.colors),
      fonts:       ()=>this.tFonts(data.fonts),
    };
    document.getElementById('tabContent').innerHTML =
      `<div class="fu">${(map[tab]||map.overview)()}</div>`;
  },

  /* ── 1. Overview ── */
  tOverview(d) {
    const comps = d.structure.components||[];
    const da = d.domain?.da !== null && d.domain?.da !== undefined ? d.domain.da+'/10' : 'N/A';
    const rank = d.ranking?.globalRank ? '#'+Number(d.ranking.globalRank).toLocaleString() : 'N/A';

    // Site health score
    let health = 0;
    if (d.seo.score >= 70) health += 30; else if (d.seo.score >= 50) health += 15;
    if (d.seo.title) health += 10;
    if (d.seo.metaDesc) health += 10;
    if (d.seo.h1s.length === 1) health += 10;
    if (!d.indexing?.noindex) health += 10;
    if (d.tech.detected.length > 0) health += 10;
    if (d.contacts.emails.length > 0 || Object.keys(d.contacts.social).length > 0) health += 10;
    if (d.seo.noAlt === 0) health += 10;
    const healthCls = health >= 70 ? 'sg' : health >= 50 ? 'so' : 'sb';
    const healthLabel = health >= 70 ? 'Healthy' : health >= 50 ? 'Needs Work' : 'Poor';
    const healthDesc = health >= 70
      ? 'This site has good SEO, contacts, and technical setup.'
      : health >= 50
      ? 'Some improvements needed — check SEO and accessibility tabs.'
      : 'Multiple issues found — review SEO, indexing, and contacts.';

    // Build issues/warnings/passed from seo checks
    const checks = d.seo.checks || d.seo.warnings || [];
    const errItems  = checks.filter(c => c.type === 'error');
    const warnItems = checks.filter(c => c.type === 'warn');
    const okItems   = checks.filter(c => c.type === 'ok');

    const issuesSummary = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-clipboard2-pulse-fill"></i> SEO Report Summary</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1rem">
        <div style="background:rgba(240,68,68,.08);border:1px solid rgba(240,68,68,.22);border-radius:10px;padding:.875rem;text-align:center">
          <div style="font-size:1.6rem;font-weight:900;color:var(--red)">${errItems.length}</div>
          <div style="font-size:.72rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.06em">Errors</div>
        </div>
        <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.22);border-radius:10px;padding:.875rem;text-align:center">
          <div style="font-size:1.6rem;font-weight:900;color:var(--yellow)">${warnItems.length}</div>
          <div style="font-size:.72rem;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.06em">Warnings</div>
        </div>
        <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22);border-radius:10px;padding:.875rem;text-align:center">
          <div style="font-size:1.6rem;font-weight:900;color:var(--green)">${okItems.length}</div>
          <div style="font-size:.72rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em">Passed</div>
        </div>
      </div>
      ${errItems.length ? `<div style="margin-bottom:.5rem">${errItems.map(c=>`<div class="a11y-row a11y-warn" style="background:rgba(240,68,68,.06);border-color:rgba(240,68,68,.2)"><i class="bi bi-x-circle-fill" style="color:var(--red)"></i>${c.msg}</div>`).join('')}</div>` : ''}
      ${warnItems.length ? `<div style="margin-bottom:.5rem">${warnItems.map(c=>this.warnRow(c)).join('')}</div>` : ''}
      ${okItems.length ? `<details style="margin-top:.25rem"><summary style="cursor:pointer;font-size:.8rem;color:var(--muted);padding:.3rem 0">${okItems.length} checks passed ▸</summary><div style="margin-top:.35rem">${okItems.map(c=>this.warnRow(c)).join('')}</div></details>` : ''}
    </div>`;

    return issuesSummary + `
    <div class="health-gauge">
      <div class="health-ring ${healthCls}">${health}</div>
      <div class="health-info">
        <h4>Site Health Score: ${healthLabel}</h4>
        <p>${healthDesc}</p>
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-info-circle-fill"></i> Website Overview</div>
        ${this.irow('URL',      `<a href="${this.e(d.url)}" target="_blank" style="color:var(--primary2);word-break:break-all">${this.e(d.url)}</a>`)}
        ${this.irow('Title',    this.e(d.seo.title)||'—')}
        ${this.irow('Domain',   this.e(d.domain?.hostname||new URL(d.url).hostname))}
        ${this.irow('Type',     d.overview.type)}
        ${this.irow('Language', d.overview.lang)}
        ${this.irow('Words',    (d.content.wordCount||0).toLocaleString())}
        ${this.irow('Sections', d.overview.sections)}
        ${this.irow('HTML Size',d.performance.htmlSizeKB+' KB')}
        ${this.irow('Scanned',  new Date(d.scannedAt).toLocaleString())}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-shield-check"></i> Quick Checks</div>
        ${this.crow('Meta Title',       !!d.seo.title)}
        ${this.crow('Meta Description', !!d.seo.metaDesc)}
        ${this.crow('Single H1 Tag',    d.seo.h1s.length===1)}
        ${this.crow('OG / Social Tags', !!d.seo.ogTitle)}
        ${this.crow('Viewport Meta',    !!d.seo.viewport)}
        ${this.crow('All Images Alt',   d.seo.noAlt===0)}
        ${this.crow('Indexing Allowed', !d.indexing?.noindex)}
        ${this.crow('Robots.txt Found', d.indexing?.robotsTxt==='Found')}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Key Metrics</div>
        <div class="authority-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="auth-card"><div class="auth-val" style="color:var(--green)">${d.seo.score}</div><div class="auth-lbl">SEO Score</div></div>
          <div class="auth-card"><div class="auth-val" style="color:var(--primary2)">${da}</div><div class="auth-lbl">DA (est.)</div></div>
          <div class="auth-card"><div class="auth-val" style="color:var(--accent);font-size:1rem">${rank}</div><div class="auth-lbl">Global Rank</div></div>
          <div class="auth-card"><div class="auth-val" style="color:var(--yellow)">${d.links.totalInternal+d.links.totalExternal}</div><div class="auth-lbl">Total Links</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-puzzle-fill"></i> Detected Components</div>
        <div class="comp-grid">
          ${comps.map(c=>`<div class="comp-item ${c.found?'comp-found':'comp-missing'}">
            <i class="bi bi-${c.found?'check-circle-fill':'x-circle'}"></i>${c.name}</div>`).join('')}
        </div>
      </div>
    </div>`;
  },

  /* ── 2. SEO Score ── */
  tSEO(seo) {
    const cls   = seo.score >= 70 ? 'sg' : seo.score >= 50 ? 'so' : 'sb';
    const grade = seo.score >= 70 ? 'Good' : seo.score >= 50 ? 'Needs Work' : 'Poor';
    const checks = seo.checks || seo.warnings || [];
    const passed  = checks.filter(c => c.type === 'ok');
    const warns   = checks.filter(c => c.type === 'warn');
    const errors  = checks.filter(c => c.type === 'error');

    // Group checks by category
    const cats = {};
    checks.forEach(c => {
      const cat = c.category || 'General';
      (cats[cat] = cats[cat] || []).push(c);
    });

    const catColors = { Meta:'var(--primary2)', Content:'var(--green)', Images:'var(--yellow)', Technical:'var(--accent)', Social:'var(--purple)', General:'var(--muted)' };

    const checksHtml = Object.entries(cats).map(([cat, items]) => `
      <div style="margin-bottom:.75rem">
        <div style="font-size:.7rem;font-weight:700;color:${catColors[cat]||'var(--muted)'};text-transform:uppercase;letter-spacing:.08em;margin-bottom:.35rem;display:flex;align-items:center;gap:.4rem">
          ${cat}<span style="flex:1;height:1px;background:var(--border);display:inline-block"></span>
        </div>
        ${items.map(w => this.warnRow(w)).join('')}
      </div>`).join('');

    return `
    <div class="g2" style="align-items:start;margin-bottom:1.25rem">
      <div class="card">
        <div class="card-head"><i class="bi bi-graph-up-arrow"></i> SEO Score</div>
        <div class="score-box">
          <div class="score-ring ${cls}">${seo.score}</div>
          <div class="score-grade">${grade}</div>
          <div class="score-sub">${seo.imagesTotal} images · ${seo.withAlt} with alt · ${seo.noAlt} missing</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:1rem">
          <div style="text-align:center;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:.6rem">
            <div style="font-size:1.3rem;font-weight:800;color:var(--green)">${passed.length}</div>
            <div style="font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Passed</div>
          </div>
          <div style="text-align:center;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:.6rem">
            <div style="font-size:1.3rem;font-weight:800;color:var(--yellow)">${warns.length}</div>
            <div style="font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Warnings</div>
          </div>
          <div style="text-align:center;background:rgba(240,68,68,.08);border:1px solid rgba(240,68,68,.2);border-radius:8px;padding:.6rem">
            <div style="font-size:1.3rem;font-weight:800;color:var(--red)">${errors.length}</div>
            <div style="font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Errors</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-list-check"></i> SEO Checks by Category</div>
        ${checksHtml || (seo.warnings||[]).map(w=>this.warnRow(w)).join('')}
      </div>
    </div>`;
  },

  /* ── 3. Domain Authority / PA ── */
  tDomain(d, seo, overview) {
    const score  = seo.score;
    const hasDA  = d?.da !== null && d?.da !== undefined;
    const daVal  = hasDA ? d.da : '—';
    const daNote = hasDA ? 'Open PageRank (0–10)' : 'Not available';
    const daColor= hasDA ? 'var(--primary2)' : 'var(--muted)';
    const paEst  = Math.min(100, Math.round(score * 0.85 + (seo.h1s.length === 1 ? 5 : 0) + (seo.canonical ? 5 : 0)));
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-globe-americas"></i> Domain Info</div>
        ${this.irow('Domain',   `<strong>${this.e(d?.hostname||'—')}</strong>`)}
        ${this.irow('Type',     overview.type)}
        ${this.irow('Language', overview.lang)}
        ${this.irow('Registered', d?.age || '<em style="color:var(--muted)">Unknown</em>')}
        ${d?.ip      ? this.irow('IP Address', `<code style="color:var(--primary2)">${this.e(d.ip)}</code>`) : ''}
        ${d?.country ? this.irow('Country',    this.e(d.country)) : ''}
        ${d?.city    ? this.irow('City',       this.e(d.city)) : ''}
        ${d?.isp     ? this.irow('ISP',        this.e(d.isp)) : ''}
        ${d?.org     ? this.irow('Org / Host', this.e(d.org)) : ''}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Authority Metrics</div>
        <div class="authority-grid">
          <div class="auth-card">
            <div class="auth-val" style="color:${daColor}">${daVal}</div>
            <div class="auth-lbl">Domain Authority</div>
            <div class="auth-note">${daNote}</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--accent)">${paEst}</div>
            <div class="auth-lbl">Page Authority</div>
            <div class="auth-note">Estimated from SEO score</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--green)">${score}</div>
            <div class="auth-lbl">SEO Score</div>
            <div class="auth-note">On-page analysis</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--yellow);font-size:1rem">${d?.rank ? '#'+Number(d.rank).toLocaleString() : '—'}</div>
            <div class="auth-lbl">OPR Rank</div>
            <div class="auth-note">Open PageRank</div>
          </div>
        </div>
        ${!hasDA ? `<div class="auth-note-box" style="margin-top:.75rem"><i class="bi bi-info-circle"></i> Domain Authority requires the Open PageRank API. It may not be available for all domains. For exact DA/PA use <a href="https://moz.com/link-explorer" target="_blank" style="color:var(--primary2)">Moz ↗</a> or <a href="https://ahrefs.com" target="_blank" style="color:var(--primary2)">Ahrefs ↗</a></div>` : ''}
        <div class="auth-note-box" style="margin-top:.75rem"><i class="bi bi-info-circle"></i> Page Authority is estimated from on-page SEO signals. It is <strong>not</strong> an official Moz score.</div>
      </div>
    </div>`;
  },

  /* ── 4. Ranking ── */
  tRanking(r, d) {
    const globalRank = r?.globalRank ? '#'+Number(r.globalRank).toLocaleString() : null;
    const pageRank   = r?.pageRank != null ? r.pageRank+'/10' : null;
    const hasData    = !!r?.source;
    const hasSpeed   = r?.perfScore != null;
    const speedColor = r?.perfScore >= 90 ? 'var(--green)' : r?.perfScore >= 50 ? 'var(--yellow)' : 'var(--red)';

    const speedCard = hasSpeed ? `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-speedometer2" style="color:var(--green)"></i> Google PageSpeed Insights <span style="font-size:.7rem;color:var(--muted);font-weight:400">(Mobile)</span></div>
      <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;margin-bottom:1rem">
        <div class="score-ring" style="border-color:${speedColor};color:${speedColor};flex-shrink:0">${r.perfScore}</div>
        <div>
          <div style="font-size:1rem;font-weight:700;color:${speedColor}">${r.perfScore>=90?'Fast':r.perfScore>=50?'Needs Improvement':'Slow'}</div>
          <div style="font-size:.8rem;color:var(--muted);margin-top:.2rem">Performance score from Google PageSpeed API</div>
        </div>
      </div>
      <div class="g2" style="gap:.75rem">
        ${r.fcp ? `<div class="auth-card"><div class="auth-val" style="font-size:1.1rem;color:var(--primary2)">${this.e(r.fcp)}</div><div class="auth-lbl">First Contentful Paint</div></div>` : ''}
        ${r.lcp ? `<div class="auth-card"><div class="auth-val" style="font-size:1.1rem;color:var(--accent)">${this.e(r.lcp)}</div><div class="auth-lbl">Largest Contentful Paint</div></div>` : ''}
        ${r.cls ? `<div class="auth-card"><div class="auth-val" style="font-size:1.1rem;color:var(--yellow)">${this.e(r.cls)}</div><div class="auth-lbl">Cumulative Layout Shift</div></div>` : ''}
        ${r.tbt ? `<div class="auth-card"><div class="auth-val" style="font-size:1.1rem;color:var(--purple)">${this.e(r.tbt)}</div><div class="auth-lbl">Total Blocking Time</div></div>` : ''}
      </div>
    </div>` : '';

    const manualLinks = `
      <div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <a href="https://www.similarweb.com/website/${r?.hostname||''}" target="_blank" class="exp-btn"><i class="bi bi-box-arrow-up-right"></i> SimilarWeb</a>
        <a href="https://ahrefs.com/website-authority-checker/?target=${r?.hostname||''}" target="_blank" class="exp-btn"><i class="bi bi-box-arrow-up-right"></i> Ahrefs</a>
        <a href="https://moz.com/domain-analysis?site=${r?.hostname||''}" target="_blank" class="exp-btn"><i class="bi bi-box-arrow-up-right"></i> Moz</a>
        <a href="https://pagespeed.web.dev/report?url=${encodeURIComponent(r?.hostname||'')}" target="_blank" class="exp-btn"><i class="bi bi-speedometer2"></i> PageSpeed</a>
      </div>`;

    return speedCard + `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-trophy-fill"></i> Website Ranking</div>
        <div class="authority-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="auth-card"><div class="auth-val" style="color:var(--primary2);font-size:1.3rem">${globalRank||'N/A'}</div><div class="auth-lbl">Global Rank</div><div class="auth-note">${r?.source||'Not available'}</div></div>
          <div class="auth-card"><div class="auth-val" style="color:var(--accent);font-size:1.3rem">${pageRank||'N/A'}</div><div class="auth-lbl">PageRank Score</div><div class="auth-note">Open PageRank (0–10)</div></div>
        </div>
        ${!hasData?`<div class="a11y-row a11y-warn" style="margin-top:.75rem"><i class="bi bi-exclamation-triangle-fill"></i> ${this.e(r?.error||'Ranking data not available for this domain')}</div>`:''}
        ${manualLinks}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-info-circle-fill"></i> About Ranking Data</div>
        <div class="auth-note-box" style="margin-bottom:.75rem"><i class="bi bi-info-circle"></i> Ranking data is from Open PageRank API. PageSpeed data is from Google's free API.</div>
        ${this.irow('Data Source', r?.source||'Not available')}
        ${this.irow('Domain', this.e(r?.hostname||d?.hostname||'—'))}
        ${this.irow('PageRank Score', pageRank||'N/A')}
        ${this.irow('Global Rank', globalRank||'N/A')}
        ${hasSpeed ? this.irow('PageSpeed Score', `<span style="color:${speedColor};font-weight:700">${r.perfScore}/100</span>`) : ''}
      </div>
    </div>`;
  },

  /* ── 5. Keywords & Tags ── */
  tKeywords(content) {
    const r = content.readability || { score: 0, grade: 'N/A', label: 'N/A' };
    const scoreColor = r.score >= 70 ? 'var(--green)' : r.score >= 50 ? 'var(--yellow)' : 'var(--red)';
    const bigrams  = content.bigrams  || [];
    const trigrams = content.trigrams || [];

    const readabilityCard = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-book-fill"></i> Readability</div>
      <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
        <div class="score-ring" style="color:${scoreColor};border-color:${scoreColor};flex-shrink:0">${r.score}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;color:${scoreColor}">${r.label}</div>
          <div style="color:var(--muted);font-size:.85rem">Flesch-Kincaid Reading Ease (0–100)</div>
          <div style="margin-top:.5rem;display:flex;gap:1rem;flex-wrap:wrap">
            ${this.irow('Words', (content.wordCount||0).toLocaleString())}
            ${this.irow('Paragraphs', content.paragraphCount||0)}
          </div>
        </div>
      </div>
    </div>`;

    const bigramsCard = bigrams.length ? `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-chat-quote-fill"></i> Top Two-Word Phrases</div>
      <div class="kw-table">
        <div class="kw-header"><span>Phrase</span><span>Count</span></div>
        ${bigrams.map(b=>`<div class="kw-row">
          <span class="kw-word" data-kw="${this.e(b.phrase)}" onclick="UI.copy(this.dataset.kw)" title="Click to copy">${this.e(b.phrase)}</span>
          <span class="kw-count">${b.count}</span>
        </div>`).join('')}
      </div>
    </div>` : '';

    const trigramsCard = trigrams.length ? `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-chat-dots-fill"></i> Top Three-Word Phrases</div>
      ${trigrams.map(t=>`<div class="litem"><i class="bi bi-dot"></i><span style="flex:1">${this.e(t.phrase)}</span><span class="kw-count">${t.count}</span>${this.copyBtn(t.phrase)}</div>`).join('')}
    </div>` : '';

    return readabilityCard + bigramsCard + trigramsCard + `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Keyword Density <span class="badge-cnt">${content.keywords.length}</span></div>
        <div class="kw-table">
          <div class="kw-header"><span>Keyword</span><span>Count</span><span>Density</span></div>
          ${content.keywords.map(k=>`<div class="kw-row">
            <span class="kw-word" data-kw="${this.e(k.word)}" onclick="UI.copy(this.dataset.kw)" title="Click to copy">${this.e(k.word)}</span>
            <span class="kw-count">${k.count}</span>
            <span class="kw-density"><span class="kw-bar" style="width:${Math.min(parseFloat(k.density)*10,100)}%"></span>${k.density}%</span>
          </div>`).join('')}
        </div>
        <button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${content.keywords.map(k=>k.word).join(', ')}')"><i class="bi bi-clipboard"></i> Copy All Keywords</button>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><i class="bi bi-lightbulb-fill"></i> Topics</div>
          ${content.topics.length?content.topics.map(t=>`<div class="litem"><i class="bi bi-dot"></i><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join(''):this.empty('No topics extracted')}
        </div>
        <div class="card">
          <div class="card-head"><i class="bi bi-hash"></i> Meta Keywords / Tags</div>
          ${content.tags.length
            ?`<div class="tags">${content.tags.map(t=>`<span class="tag" data-tag="${this.e(t)}" onclick="UI.copy(this.dataset.tag)" style="cursor:pointer">#${this.e(t)}</span>`).join('')}</div>
              <button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${content.tags.join(', ')}')"><i class="bi bi-clipboard"></i> Copy All</button>`
            :this.empty('No meta keywords')}
        </div>
      </div>
    </div>`;
  },

  /* ── 6. Headings Structure ── */
  tHeadings(seo) {
    const h1s = seo.h1s||[], h2s = seo.h2s||[], h3s = seo.h3s||[];
    return `
    <div class="stats-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon">H1</div><div class="stat-val" style="color:${h1s.length===1?'var(--green)':h1s.length===0?'var(--red)':'var(--yellow)'}">${h1s.length}</div><div class="stat-lbl">${h1s.length===1?'✓ Correct':h1s.length===0?'✗ Missing':'⚠ Multiple'}</div></div>
      <div class="stat-card"><div class="stat-icon">H2</div><div class="stat-val" style="color:var(--primary2)">${h2s.length}</div><div class="stat-lbl">H2 Tags</div></div>
      <div class="stat-card"><div class="stat-icon">H3</div><div class="stat-val" style="color:var(--accent)">${h3s.length}</div><div class="stat-lbl">H3 Tags</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-type-h1"></i> H1 Tags <span class="badge-cnt">${h1s.length}</span></div>
        ${h1s.length?h1s.map(h=>`<div class="cta-row"><span class="cta-badge">H1</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')
          :'<div class="a11y-row a11y-warn"><i class="bi bi-exclamation-triangle-fill"></i> No H1 tag found — critical SEO issue</div>'}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-type-h2"></i> H2 Tags <span class="badge-cnt">${h2s.length}</span></div>
        ${h2s.length?h2s.map(h=>`<div class="cta-row"><span class="cta-badge sec">H2</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join(''):this.empty('No H2 tags found')}
      </div>
    </div>
    ${h3s.length?`<div class="card">
      <div class="card-head"><i class="bi bi-type-h3"></i> H3 Tags <span class="badge-cnt">${h3s.length}</span></div>
      ${h3s.map(h=>`<div class="cta-row"><span class="cta-badge" style="background:var(--bg4);color:var(--muted)">H3</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')}
    </div>`:''}`;
  },

  /* ── 7. Links ── */
  tLinks(links) {
    const linkRow = l=>`<div class="litem"><i class="bi bi-link-45deg"></i><div style="flex:1;min-width:0"><div style="font-size:.82rem;word-break:break-all">${this.e(l.href)}</div>${l.anchor?`<div style="font-size:.72rem;color:var(--muted)">${this.e(l.anchor)}</div>`:''}</div>${this.copyBtn(l.href)}</div>`;
    return `
    <div class="stats-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon">🔗</div><div class="stat-val">${links.totalInternal}</div><div class="stat-lbl">Internal Links</div></div>
      <div class="stat-card"><div class="stat-icon">🌐</div><div class="stat-val">${links.totalExternal}</div><div class="stat-lbl">External Links</div></div>
      <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-val">${links.cta.length}</div><div class="stat-lbl">CTA Links</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-house-fill"></i> Internal Links <span class="badge-cnt">${links.internal.length}</span></div>
        ${links.internal.length?links.internal.map(linkRow).join(''):this.empty('No internal links found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-box-arrow-up-right"></i> External Links <span class="badge-cnt">${links.external.length}</span></div>
        ${links.external.length?links.external.map(linkRow).join(''):this.empty('No external links found')}
      </div>
    </div>`;
  },

  /* ── 8. Images SEO ── */
  tImages(images) {
    const ph=`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='108' height='76'><rect fill='%23162035' width='108' height='76'/><text x='50%25' y='50%25' fill='%237a8fa8' text-anchor='middle' dy='.3em' font-size='11' font-family='sans-serif'>No Preview</text></svg>`;
    return `
    <div class="stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon">🖼️</div><div class="stat-val">${images.total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-val">${images.withAlt}</div><div class="stat-lbl">With Alt</div></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-val" style="color:${images.missingAltCount>0?'var(--red)':'var(--green)'}">${images.missingAltCount}</div><div class="stat-lbl">Missing Alt</div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-val">${images.lazyCount}</div><div class="stat-lbl">Lazy Load</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-exclamation-triangle-fill"></i> Image SEO Issues</div>
        ${images.issues.map(w=>this.warnRow(w)).join('')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-exclamation-circle-fill"></i> Missing Alt Text <span class="badge-cnt">${images.missingAltCount}</span></div>
        ${images.missingAlt.length?images.missingAlt.map(img=>`<div class="litem" style="font-size:.78rem"><i class="bi bi-image"></i><span style="word-break:break-all;flex:1">${this.e(img.src.split('/').pop()||img.src)}</span>${this.copyBtn(img.src)}</div>`).join(''):this.empty('All images have alt text ✓')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-images"></i> All Images <span class="badge-cnt">${images.total}</span></div>
      ${images.images.length?`<div class="media-grid">${images.images.map(img=>`<div class="media-card" title="${this.e(img.alt||img.src)}"><img src="${this.e(img.src)}" alt="${this.e(img.alt)}" loading="lazy" onerror="this.src='${ph}'"><div class="media-lbl-row"><span class="media-lbl ${img.hasAlt&&img.alt.trim()?'':'media-lbl-warn'}">${img.hasAlt&&img.alt.trim()?this.e(img.alt):'⚠ No alt'}</span><button class="copy-btn-sm" onclick="UI.copy('${img.src.replace(/'/g,"\\'")}')"><i class="bi bi-clipboard"></i></button></div></div>`).join('')}</div>`:this.empty('No images found')}
    </div>`;
  },

  /* ── 9. Contacts ── */
  tContacts(c) {
    const si={Twitter:'twitter-x',Facebook:'facebook',LinkedIn:'linkedin',Instagram:'instagram',YouTube:'youtube',GitHub:'github',TikTok:'tiktok',Pinterest:'pinterest',Telegram:'telegram','X (Twitter)':'twitter-x'};
    const socialCount = Object.values(c.social).flat().length;
    const summary = `
    <div class="section-page-header">
      <h3><i class="bi bi-person-lines-fill" style="color:var(--accent)"></i> Contact Information</h3>
      <p>Emails, phone numbers, WhatsApp links, and social media profiles found on this page.</p>
    </div>
    <div class="contact-summary">
      <div class="cs-card"><div class="cs-val" style="color:var(--primary2)">${c.emails.length}</div><div class="cs-lbl">Emails</div></div>
      <div class="cs-card"><div class="cs-val" style="color:var(--green)">${c.phones.length}</div><div class="cs-lbl">Phones</div></div>
      <div class="cs-card"><div class="cs-val" style="color:var(--accent)">${c.whatsapp?.length||0}</div><div class="cs-lbl">WhatsApp</div></div>
      <div class="cs-card"><div class="cs-val" style="color:var(--purple)">${socialCount}</div><div class="cs-lbl">Social</div></div>
    </div>`;
    return summary + `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-envelope-fill"></i> Emails <span class="badge-cnt">${c.emails.length}</span></div>
        ${c.emails.length?c.emails.map(e=>`<div class="litem"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}" style="flex:1">${e}</a>${this.copyBtn(e)}</div>`).join(''):this.empty('No emails found')}
        ${c.emails.length>1?`<button class="exp-btn" style="margin-top:.75rem" onclick="UI.copy('${c.emails.join('\\n')}')"><i class="bi bi-clipboard"></i> Copy All</button>`:''}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-telephone-fill"></i> Phone Numbers <span class="badge-cnt">${c.phones.length}</span></div>
        ${c.phones.length?c.phones.map(p=>`<div class="litem"><i class="bi bi-telephone-fill"></i><a href="tel:${p}" style="flex:1">${p}</a>${this.copyBtn(p)}</div>`).join(''):this.empty('No phone numbers found')}
      </div>
      ${c.whatsapp&&c.whatsapp.length?`<div class="card"><div class="card-head"><i class="bi bi-whatsapp"></i> WhatsApp</div>${c.whatsapp.map(w=>`<div class="litem"><i class="bi bi-whatsapp"></i><a href="${this.e(w)}" target="_blank" style="flex:1">${this.e(w)}</a>${this.copyBtn(w)}</div>`).join('')}</div>`:''}
      ${c.addresses&&c.addresses.length?`<div class="card"><div class="card-head"><i class="bi bi-geo-alt-fill"></i> Addresses</div>${c.addresses.map(a=>`<div class="litem"><i class="bi bi-geo-alt-fill"></i><span style="flex:1">${this.e(a)}</span>${this.copyBtn(a)}</div>`).join('')}</div>`:''}
      ${c.contactPage?`<div class="card"><div class="card-head"><i class="bi bi-link-45deg"></i> Contact Page</div><div class="litem"><i class="bi bi-link-45deg"></i><a href="${this.e(c.contactPage)}" target="_blank" style="flex:1">${this.e(c.contactPage)}</a>${this.copyBtn(c.contactPage)}</div></div>`:''}
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-share-fill"></i> Social Media Profiles <span class="badge-cnt">${socialCount}</span></div>
      ${Object.entries(c.social).length
        ?Object.entries(c.social).map(([k,urls])=>(Array.isArray(urls)?urls:[urls]).map(url=>`<div class="litem"><i class="bi bi-${si[k]||'link-45deg'}"></i><span class="social-platform">${k}</span><a href="${this.e(url)}" target="_blank" style="flex:1;word-break:break-all">${this.e(url)}</a>${this.copyBtn(url)}</div>`).join('')).join('')
        :this.empty('No social links found')}
    </div>`;
  },

  /* ── 10. CTAs ── */
  tCTA(cta) {
    const blk=(lbl,items,cls)=>!items.length?'':`<div class="card"><div class="card-head"><i class="bi bi-cursor-fill"></i> ${lbl}</div>${items.map(t=>`<div class="cta-row"><span class="cta-badge ${cls}">${lbl.split(' ')[0]}</span><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join('')}</div>`;
    return `${blk('Primary CTA',cta.primary,'')}${blk('Secondary CTA',cta.secondary,'sec')}
    <div class="card">
      <div class="card-head"><i class="bi bi-list-ul"></i> All Buttons &amp; Links <span class="badge-cnt">${cta.all.length}</span></div>
      ${cta.all.map(t=>`<div class="cta-row"><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join('')||this.empty('None found')}
      ${cta.all.length?`<button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${cta.all.join('\\n')}')"><i class="bi bi-clipboard"></i> Copy All</button>`:''}
    </div>`;
  },

  /* ── 11. Tech Stack ── */
  tTech(tech) {
    const techHeader = `<div class="section-page-header">
      <h3><i class="bi bi-cpu-fill" style="color:var(--purple)"></i> Tech Stack Detector</h3>
      <p>Frameworks, CMS, analytics, CDN, and libraries detected from page source.</p>
    </div>`;
    const cats = {      'Frontend':       ['React','Vue.js','Angular','Next.js','Nuxt.js','Svelte','Alpine.js','Astro'],
      'CSS / UI':       ['Tailwind CSS','Bootstrap','Font Awesome'],
      'CMS / Platform': ['WordPress','Shopify','Webflow','Framer'],
      'Analytics':      ['Google Analytics','Google Tag Manager','Hotjar'],
      'Infrastructure': ['Cloudflare','Vercel','Netlify'],
      'Libraries':      ['jQuery','GSAP','Webpack','Vite'],
      'Payments':       ['Stripe'],
      'Support':        ['Intercom','HubSpot'],
    };
    const catColors = {
      'Frontend':'var(--primary2)','CSS / UI':'var(--accent)',
      'CMS / Platform':'var(--purple)','Analytics':'var(--yellow)',
      'Infrastructure':'var(--green)','Libraries':'var(--muted)',
      'Payments':'var(--green)','Support':'var(--yellow)',
    };
    const detected = new Set(tech.detected);
    const grouped = {};
    const uncategorized = [];
    detected.forEach(t => {
      let found = false;
      for (const [cat, items] of Object.entries(cats)) {
        if (items.includes(t)) { (grouped[cat] = grouped[cat]||[]).push(t); found = true; break; }
      }
      if (!found) uncategorized.push(t);
    });
    if (uncategorized.length) grouped['Other'] = uncategorized;

    const catHtml = Object.entries(grouped).map(([cat, items]) => `
      <div class="tech-category">
        <div class="tech-cat-label" style="color:${catColors[cat]||'var(--muted)'}">
          ${cat}
        </div>
        <div class="tech-wrap">
          ${items.map(t=>`<span class="tech-chip" style="border-color:${catColors[cat]||'var(--border)'}20"><span class="tdot" style="background:${catColors[cat]||'var(--green)'}"></span>${this.e(t)}<button class="copy-btn-sm" onclick="UI.copy('${t}')"><i class="bi bi-clipboard"></i></button></span>`).join('')}
        </div>
      </div>`).join('');

    return `${techHeader}<div class="card">
      <div class="card-head"><i class="bi bi-cpu-fill"></i> Detected Technologies <span class="badge-cnt">${tech.detected.length}</span></div>
      ${tech.detected.length ? catHtml : this.empty('No technologies detected')}
      ${tech.detected.length?`<button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${tech.detected.join(', ')}')"><i class="bi bi-clipboard"></i> Copy All</button>`:''}
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-file-code-fill"></i> Script Sources <span class="badge-cnt">${tech.scriptsCount}</span></div>
      ${tech.scriptSrcs.length?tech.scriptSrcs.map(s=>`<div class="litem" style="font-size:.78rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all;flex:1">${this.e(s)}</span>${this.copyBtn(s)}</div>`).join(''):this.empty('No external scripts')}
    </div>`;
  },

  /* ── 12. Performance ── */
  tPerf(p) {
    const bar = (lbl, val, max, unit, color) => {
      const pct = Math.min((val/max)*100, 100);
      const barColor = pct > 70 ? 'var(--red)' : pct > 40 ? 'var(--yellow)' : color||'var(--green)';
      return `<div class="perf-bar-row">
        <span class="perf-bar-lbl">${lbl}</span>
        <div class="perf-bar-wrap"><div class="perf-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="perf-bar-val" style="color:${barColor}">${val}${unit}</span>
      </div>`;
    };
    const score = p.score ?? null;
    const grade = p.grade ?? null;
    const gradeColor = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--primary2)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';
    const scoreCard = score !== null ? `
      <div class="card" style="margin-bottom:1.25rem">
        <div class="card-head"><i class="bi bi-speedometer2"></i> Performance Score</div>
        <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
          <div class="score-ring" style="border-color:${gradeColor};color:${gradeColor};flex-shrink:0">${score}</div>
          <div>
            <div style="font-size:1.1rem;font-weight:700;color:${gradeColor}">Grade ${grade}</div>
            <div style="color:var(--muted);font-size:.85rem;margin-top:.25rem">${score>=80?'Fast page':score>=65?'Moderate performance':'Needs improvement'}</div>
          </div>
        </div>
        <div style="margin-top:1rem">${(p.checks||[]).map(c=>this.warnRow(c)).join('')}</div>
      </div>` : '';
    return scoreCard + `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Page Metrics</div>
        ${bar('HTML Size',    parseFloat(p.htmlSizeKB), 500, ' KB', 'var(--primary2)')}
        ${bar('Scripts',      p.scriptsCount,  30, '', 'var(--primary2)')}
        ${bar('Stylesheets',  p.stylesCount,   10, '', 'var(--accent)')}
        ${bar('Images',       p.imagesCount,   50, '', 'var(--yellow)')}
        ${bar('Iframes',      p.iframesCount,  5,  '', 'var(--purple)')}
        ${bar('Inline JS',    parseFloat(p.inlineKB), 100, ' KB', 'var(--muted)')}
        ${p.lazyImgs !== undefined ? bar('Lazy Images', p.lazyImgs, p.imagesCount||1, '', 'var(--green)') : ''}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-universal-access"></i> Accessibility Checks</div>
        ${(p.a11y||[]).map(w=>this.warnRow(w)).join('')}
      </div>
    </div>`;
  },

  /* ── 13. Meta Tags ── */
  tMetaTags(seo) {
    const ogImg   = seo.ogImage   || '';
    const ogTitle = seo.ogTitle   || seo.title || 'No title';
    const ogDesc  = seo.ogDesc    || seo.metaDesc || 'No description';
    const twCard  = (seo.twitterTags||[]).find(t=>t.name==='twitter:card')?.content || 'summary';
    const twTitle = (seo.twitterTags||[]).find(t=>t.name==='twitter:title')?.content || ogTitle;
    const twDesc  = (seo.twitterTags||[]).find(t=>t.name==='twitter:description')?.content || ogDesc;
    const twImg   = (seo.twitterTags||[]).find(t=>t.name==='twitter:image')?.content || ogImg;
    const siteName= (seo.ogTags||[]).find(t=>t.property==='og:site_name')?.content || '';

    const previewSection = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-head"><i class="bi bi-eye-fill"></i> Social Preview Cards</div>
      <div class="og-previews">

        <!-- Twitter/X Card -->
        <div class="og-preview-wrap">
          <div class="og-preview-label"><i class="bi bi-twitter-x"></i> Twitter / X</div>
          <div class="og-card og-card-twitter ${twCard==='summary_large_image'?'og-card-large':''}">
            ${twImg?`<div class="og-img-wrap"><img src="${this.e(twImg)}" alt="OG Image" onerror="this.parentElement.style.display='none'"></div>`:'<div class="og-img-placeholder"><i class="bi bi-image"></i></div>'}
            <div class="og-card-body">
              <div class="og-card-site">${this.e(siteName||'twitter.com')}</div>
              <div class="og-card-title">${this.e(twTitle)}</div>
              <div class="og-card-desc">${this.e(twDesc)}</div>
            </div>
          </div>
        </div>

        <!-- Facebook / LinkedIn Card -->
        <div class="og-preview-wrap">
          <div class="og-preview-label"><i class="bi bi-facebook"></i> Facebook / LinkedIn</div>
          <div class="og-card og-card-fb">
            ${ogImg?`<div class="og-img-wrap"><img src="${this.e(ogImg)}" alt="OG Image" onerror="this.parentElement.style.display='none'"></div>`:'<div class="og-img-placeholder"><i class="bi bi-image"></i></div>'}
            <div class="og-card-body">
              <div class="og-card-site">${this.e(siteName||'').toUpperCase()}</div>
              <div class="og-card-title">${this.e(ogTitle)}</div>
              <div class="og-card-desc">${this.e(ogDesc)}</div>
            </div>
          </div>
        </div>

        <!-- Google Search Snippet -->
        <div class="og-preview-wrap">
          <div class="og-preview-label"><i class="bi bi-google"></i> Google Search Snippet</div>
          <div class="og-card og-card-google">
            <div class="og-google-title">${this.e(seo.title||'No title')}</div>
            <div class="og-google-url">${this.e(seo.canonical||'https://example.com')}</div>
            <div class="og-google-desc">${this.e(seo.metaDesc||'No meta description found.')}</div>
          </div>
        </div>

      </div>
    </div>`;

    return previewSection + `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-tags-fill"></i> Core Meta Tags</div>
        ${this.irow('Title',       this.miss(seo.title)+(seo.title?` <small style="color:var(--muted)">(${seo.title.length} chars)</small>`:''))}
        ${this.irow('Description', this.miss(seo.metaDesc)+(seo.metaDesc?` <small style="color:var(--muted)">(${seo.metaDesc.length} chars)</small>`:''))}
        ${this.irow('Keywords',    this.none(seo.metaKw))}
        ${this.irow('Canonical',   this.none(seo.canonical))}
        ${this.irow('Viewport',    this.miss(seo.viewport))}
        ${this.irow('Robots',      this.none((seo.allMeta||[]).find(m=>m.name==='robots')?.content))}
        ${this.irow('Author',      this.none((seo.allMeta||[]).find(m=>m.name==='author')?.content))}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-share-fill"></i> Open Graph Tags</div>
        ${(seo.ogTags||[]).length?(seo.ogTags||[]).map(t=>`${this.irow(this.e(t.property),this.e(t.content))}`).join(''):this.empty('No OG tags found')}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-twitter-x"></i> Twitter / X Tags</div>
        ${(seo.twitterTags||[]).length?(seo.twitterTags||[]).map(t=>`${this.irow(this.e(t.name),this.e(t.content))}`).join(''):this.empty('No Twitter tags found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-code-square"></i> All Meta Tags <span class="badge-cnt">${(seo.allMeta||[]).length}</span></div>
        <div style="overflow-x:auto"><table class="meta-table">
          <thead><tr><th>Name / Property</th><th>Content</th><th></th></tr></thead>
          <tbody>${(seo.allMeta||[]).map(m=>`<tr><td><code>${this.e(m.name)}</code></td><td style="word-break:break-word;max-width:300px">${this.e(m.content)}</td><td>${this.copyBtn(m.content)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
    </div>`;
  },

  /* ── 14. Robots & Indexing ── */
  tIndexing(idx) {
    if (!idx) return this.empty('Indexing data not available');
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-robot"></i> Indexing Status</div>
        <div class="authority-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="auth-card"><div class="auth-val" style="color:${idx.noindex?'var(--red)':'var(--green)'};font-size:1rem">${idx.indexStatus}</div><div class="auth-lbl">Index Status</div></div>
          <div class="auth-card"><div class="auth-val" style="color:${idx.nofollow?'var(--yellow)':'var(--green)'};font-size:1rem">${idx.nofollow?'Nofollow':'Follow'}</div><div class="auth-lbl">Link Following</div></div>
          <div class="auth-card"><div class="auth-val" style="color:${idx.robotsTxt==='Found'?'var(--green)':'var(--red)'};font-size:.9rem">${idx.robotsTxt}</div><div class="auth-lbl">robots.txt</div></div>
          <div class="auth-card"><div class="auth-val" style="color:${idx.sitemapUrl?'var(--green)':'var(--muted)'};font-size:.9rem">${idx.sitemapUrl?'Found':'Not found'}</div><div class="auth-lbl">Sitemap</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-list-check"></i> Meta Directives</div>
        ${this.irow('Robots Meta',  this.none(idx.robotsMeta))}
        ${this.irow('Googlebot',    this.none(idx.googlebot))}
        ${this.irow('Canonical',    this.none(idx.canonical))}
        ${this.irow('No Index',     idx.noindex?'<span style="color:var(--red)">Yes — page blocked</span>':'<span style="color:var(--green)">No — indexing allowed</span>')}
        ${this.irow('No Follow',    idx.nofollow?'<span style="color:var(--yellow)">Yes</span>':'<span style="color:var(--green)">No</span>')}
        ${this.irow('No Archive',   idx.noarchive?'<span style="color:var(--yellow)">Yes</span>':'No')}
        ${idx.sitemapUrl?this.irow('Sitemap URL',`<a href="${this.e(idx.sitemapUrl)}" target="_blank" style="color:var(--primary2)">${this.e(idx.sitemapUrl)}</a>`):''}
      </div>
    </div>
    ${idx.robotsDisallows&&idx.robotsDisallows.length?`<div class="card">
      <div class="card-head"><i class="bi bi-slash-circle-fill"></i> robots.txt Disallowed Paths <span class="badge-cnt">${idx.robotsDisallows.length}</span></div>
      ${idx.robotsDisallows.map(p=>`<div class="litem"><i class="bi bi-slash-circle"></i><code style="flex:1">${this.e(p)}</code>${this.copyBtn(p)}</div>`).join('')}
    </div>`:''}
    ${idx.schemas&&idx.schemas.length?`<div class="card">
      <div class="card-head"><i class="bi bi-braces"></i> Schema.org Structured Data</div>
      <div class="tags">${idx.schemas.map(s=>`<span class="tag">${this.e(s)}</span>`).join('')}</div>
    </div>`:''}
    ${idx.hreflang&&idx.hreflang.length?`<div class="card">
      <div class="card-head"><i class="bi bi-translate"></i> Hreflang Tags <span class="badge-cnt">${idx.hreflang.length}</span></div>
      ${idx.hreflang.map(h=>`<div class="litem"><i class="bi bi-translate"></i><span class="social-platform">${h.lang}</span><span style="flex:1;word-break:break-all">${this.e(h.href)}</span></div>`).join('')}
    </div>`:''}`;
  },

  /* ── Security ── */
  tSecurity(sec, url) {
    if (!sec) return this.empty('Security data not available');
    const gradeColor = sec.score >= 80 ? 'var(--green)' : sec.score >= 65 ? 'var(--primary2)' : sec.score >= 50 ? 'var(--yellow)' : 'var(--red)';
    const gradeDesc  = sec.score >= 80 ? 'Good security posture' : sec.score >= 65 ? 'Some improvements recommended' : sec.score >= 50 ? 'Several issues found' : 'Critical issues detected';
    return `
    <div class="g2" style="align-items:start">
      <div class="card">
        <div class="card-head"><i class="bi bi-shield-lock-fill"></i> Security Score</div>
        <div class="score-box">
          <div class="score-ring" style="border-color:${gradeColor};color:${gradeColor}">${sec.score}</div>
          <div class="score-grade" style="color:${gradeColor}">Grade ${sec.grade}</div>
          <div class="score-sub">${gradeDesc}</div>
        </div>
        <div style="margin-top:1rem">
          ${this.irow('HTTPS', sec.https
            ? '<span style="color:var(--green);font-weight:700"><i class="bi bi-lock-fill"></i> Secure</span>'
            : '<span style="color:var(--red);font-weight:700"><i class="bi bi-unlock-fill"></i> Not Secure</span>')}
          ${this.irow('External Scripts', sec.extScripts?.length || 0)}
          ${this.irow('Iframes', sec.iframeCount || 0)}
          ${this.irow('Password Fields', sec.passwordFields || 0)}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-list-check"></i> Security Checks</div>
        ${(sec.checks || []).map(c => {
          const icon = c.type === 'ok' ? 'check-circle-fill' : c.type === 'warn' ? 'exclamation-triangle-fill' : 'x-circle-fill';
          const cls  = c.type === 'ok' ? 'a11y-ok' : 'a11y-warn';
          return `<div class="a11y-row ${cls}">
            <i class="bi bi-${icon}"></i>
            <div style="flex:1">
              <div style="font-weight:600">${c.label}</div>
              <div style="font-size:.8rem;opacity:.85">${c.msg}</div>
              ${c.detail ? `<div style="font-size:.75rem;margin-top:.2rem;opacity:.7">${c.detail}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ${sec.extScripts?.length ? `
    <div class="card">
      <div class="card-head"><i class="bi bi-code-slash"></i> External Scripts Loaded <span class="badge-cnt">${sec.extScripts.length}</span></div>
      ${sec.extScripts.map(s => `<div class="litem" style="font-size:.78rem"><i class="bi bi-box-arrow-up-right"></i><span style="word-break:break-all;flex:1">${this.e(s)}</span>${this.copyBtn(s)}</div>`).join('')}
    </div>` : ''}`;
  },

  /* ── Mobile Friendliness ── */
  tMobile(mob) {
    if (!mob) return this.empty('Mobile data not available');
    const gradeColor = mob.score >= 80 ? 'var(--green)' : mob.score >= 65 ? 'var(--primary2)' : mob.score >= 50 ? 'var(--yellow)' : 'var(--red)';
    return `
    <div class="g2" style="align-items:start">
      <div class="card">
        <div class="card-head"><i class="bi bi-phone-fill"></i> Mobile Score</div>
        <div class="score-box">
          <div class="score-ring" style="border-color:${gradeColor};color:${gradeColor}">${mob.score}</div>
          <div class="score-grade" style="color:${gradeColor}">Grade ${mob.grade}</div>
          <div class="score-sub">${mob.score >= 80 ? 'Mobile-friendly' : mob.score >= 50 ? 'Needs improvement' : 'Poor mobile experience'}</div>
        </div>
        <div style="margin-top:1rem">
          ${this.crow('Viewport Meta',       mob.hasViewport && mob.hasWidthDevice)}
          ${this.crow('Responsive Images',   mob.hasResponsiveImgs)}
          ${this.crow('CSS Media Queries',   mob.hasMediaQueries)}
          ${this.crow('PWA Manifest',        mob.hasManifest)}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-list-check"></i> Mobile Checks</div>
        ${(mob.checks || []).map(c => {
          const icon = c.type === 'ok' ? 'check-circle-fill' : c.type === 'warn' ? 'exclamation-triangle-fill' : 'x-circle-fill';
          const cls  = c.type === 'ok' ? 'a11y-ok' : 'a11y-warn';
          return `<div class="a11y-row ${cls}">
            <i class="bi bi-${icon}"></i>
            <div style="flex:1">
              <div style="font-weight:600">${c.label}</div>
              <div style="font-size:.8rem;opacity:.85">${c.msg}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  /* ── Social SEO ── */
  tSocial(seo, contacts) {
    const og = seo.ogTags || [];
    const tw = seo.twitterTags || [];
    const getOG = p => og.find(t=>t.property===p)?.content || '';
    const getTW = n => tw.find(t=>t.name===n)?.content || '';
    const ogTitle = getOG('og:title') || seo.title || '';
    const ogDesc  = getOG('og:description') || seo.metaDesc || '';
    const ogImg   = getOG('og:image') || seo.ogImage || '';
    const ogSite  = getOG('og:site_name') || '';
    const ogType  = getOG('og:type') || '';
    const ogUrl   = getOG('og:url') || '';
    const twCard  = getTW('twitter:card') || '';
    const twTitle = getTW('twitter:title') || ogTitle;
    const twDesc  = getTW('twitter:description') || ogDesc;
    const twImg   = getTW('twitter:image') || ogImg;
    const twSite  = getTW('twitter:site') || '';
    const social  = contacts?.social || {};
    const socialCount = Object.values(social).flat().length;

    const scoreItems = [
      { ok: !!ogTitle,  label: 'OG Title' },
      { ok: !!ogDesc,   label: 'OG Description' },
      { ok: !!ogImg,    label: 'OG Image' },
      { ok: !!ogType,   label: 'OG Type' },
      { ok: !!twCard,   label: 'Twitter Card' },
      { ok: !!twTitle,  label: 'Twitter Title' },
      { ok: !!twImg,    label: 'Twitter Image' },
      { ok: socialCount > 0, label: 'Social Links Found' },
    ];
    const socialScore = Math.round((scoreItems.filter(i=>i.ok).length / scoreItems.length) * 100);
    const scoreColor = socialScore >= 75 ? 'var(--green)' : socialScore >= 50 ? 'var(--yellow)' : 'var(--red)';

    const siIcons = {Twitter:'twitter-x',Facebook:'facebook',LinkedIn:'linkedin',Instagram:'instagram',YouTube:'youtube',GitHub:'github',TikTok:'tiktok',Pinterest:'pinterest',Telegram:'telegram','X (Twitter)':'twitter-x'};

    return `
    <div class="g2" style="align-items:start;margin-bottom:1.25rem">
      <div class="card">
        <div class="card-head"><i class="bi bi-share-fill"></i> Social SEO Score</div>
        <div class="score-box">
          <div class="score-ring" style="border-color:${scoreColor};color:${scoreColor}">${socialScore}</div>
          <div class="score-grade" style="color:${scoreColor}">${socialScore>=75?'Good':socialScore>=50?'Needs Work':'Poor'}</div>
          <div class="score-sub">${scoreItems.filter(i=>i.ok).length}/${scoreItems.length} social tags present</div>
        </div>
        <div style="margin-top:1rem">
          ${scoreItems.map(i=>`<div class="crow"><span class="clbl">${i.label}</span><span class="${i.ok?'pass':'fail'}"><i class="bi bi-${i.ok?'check-circle-fill':'x-circle-fill'}"></i>${i.ok?'Present':'Missing'}</span></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-people-fill"></i> Social Profiles Found <span class="badge-cnt">${socialCount}</span></div>
        ${Object.entries(social).length ? Object.entries(social).map(([platform, urls]) =>
          (Array.isArray(urls)?urls:[urls]).map(u=>`
          <div class="litem">
            <i class="bi bi-${siIcons[platform]||'globe2'}"></i>
            <span class="social-platform">${platform}</span>
            <a href="${this.e(u)}" target="_blank" rel="noopener" style="flex:1;word-break:break-all;font-size:.82rem">${this.e(u)}</a>
            ${this.copyBtn(u)}
          </div>`).join('')
        ).join('') : this.empty('No social profiles found')}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-facebook"></i> Facebook / LinkedIn Preview</div>
        <div class="og-card" style="border-radius:var(--radius-s);overflow:hidden;background:var(--bg3);border:1px solid var(--border)">
          ${ogImg?`<div style="width:100%;height:140px;overflow:hidden;background:var(--bg4)"><img src="${this.e(ogImg)}" style="width:100%;height:140px;object-fit:cover" onerror="this.parentElement.style.display='none'"></div>`:'<div style="height:80px;display:flex;align-items:center;justify-content:center;background:var(--bg4);color:var(--muted);font-size:1.5rem"><i class="bi bi-image"></i></div>'}
          <div style="padding:.75rem">
            ${ogSite?`<div style="font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">${this.e(ogSite)}</div>`:''}
            <div style="font-weight:700;color:var(--text);margin-bottom:.2rem;line-height:1.3">${this.e(ogTitle)||'<em style="opacity:.4">No OG title</em>'}</div>
            <div style="font-size:.8rem;color:var(--muted);line-height:1.4">${this.e(ogDesc)||'<em style="opacity:.4">No OG description</em>'}</div>
          </div>
        </div>
        <div style="margin-top:.75rem">
          ${this.irow('og:title',       this.miss(ogTitle))}
          ${this.irow('og:description', this.miss(ogDesc))}
          ${this.irow('og:image',       ogImg?`<a href="${this.e(ogImg)}" target="_blank" style="color:var(--primary2);word-break:break-all;font-size:.8rem">${this.e(ogImg)}</a>`:this.miss(''))}
          ${this.irow('og:type',        this.none(ogType))}
          ${this.irow('og:url',         this.none(ogUrl))}
          ${this.irow('og:site_name',   this.none(ogSite))}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-twitter-x"></i> Twitter / X Preview</div>
        <div class="og-card" style="border-radius:var(--radius-s);overflow:hidden;background:var(--bg3);border:1px solid var(--border)">
          ${twImg?`<div style="width:100%;height:140px;overflow:hidden;background:var(--bg4)"><img src="${this.e(twImg)}" style="width:100%;height:140px;object-fit:cover" onerror="this.parentElement.style.display='none'"></div>`:'<div style="height:80px;display:flex;align-items:center;justify-content:center;background:var(--bg4);color:var(--muted);font-size:1.5rem"><i class="bi bi-image"></i></div>'}
          <div style="padding:.75rem">
            <div style="font-weight:700;color:var(--text);margin-bottom:.2rem;line-height:1.3">${this.e(twTitle)||'<em style="opacity:.4">No Twitter title</em>'}</div>
            <div style="font-size:.8rem;color:var(--muted);line-height:1.4">${this.e(twDesc)||'<em style="opacity:.4">No Twitter description</em>'}</div>
          </div>
        </div>
        <div style="margin-top:.75rem">
          ${this.irow('twitter:card',        this.miss(twCard))}
          ${this.irow('twitter:title',       this.none(twTitle))}
          ${this.irow('twitter:description', this.none(twDesc))}
          ${this.irow('twitter:image',       twImg?`<a href="${this.e(twImg)}" target="_blank" style="color:var(--primary2);word-break:break-all;font-size:.8rem">${this.e(twImg)}</a>`:this.miss(''))}
          ${this.irow('twitter:site',        this.none(twSite))}
        </div>
      </div>
    </div>`;
  },

  /* ── Colors ── */
  tColors(c) {
    if (!c.colors.length) return this.empty('No colors detected');
    const strip = `<div class="palette-strip" title="Click any color to copy">
      ${c.colors.slice(0,16).map(hex=>`<div class="palette-strip-seg" style="background:${hex}" onclick="UI.copy('${hex}')" title="${hex}"></div>`).join('')}
    </div>`;
    return `<div class="card">
      <div class="card-head"><i class="bi bi-palette-fill"></i> Color Palette <span class="badge-cnt">${c.total}</span></div>
      ${strip}
      <div class="color-grid">${c.colors.map(hex => {
        const safeHex = /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex : '';
        if (!safeHex) return '';
        return `<div class="color-item" data-hex="${safeHex}" onclick="UI.copy(this.dataset.hex)" title="Click to copy ${safeHex}"><div class="swatch" style="background:${safeHex}"></div><span class="chex">${safeHex}</span><span class="crgb">${ColorAnalyzer.toRgb(safeHex)}</span></div>`;
      }).join('')}</div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-code-slash"></i> CSS Variables</div>
      <pre>:root {\n${c.colors.map((h,i)=>`  --color-${i+1}: ${h};`).join('\n')}\n}</pre>
      <div style="display:flex;gap:.5rem;margin-top:.875rem;flex-wrap:wrap">
        <button class="exp-btn" onclick="UI.copyCSSVars(${JSON.stringify(c.colors)})"><i class="bi bi-clipboard"></i> Copy CSS Vars</button>
        <button class="exp-btn" onclick="Exporter.downloadCSS(${JSON.stringify(c.colors)})"><i class="bi bi-download"></i> Download .css</button>
      </div>
    </div>`;
  },

  /* ── Fonts ── */
  tFonts(f) {
    if (!f.fonts.length) return this.empty('No custom fonts detected');
    return `<div class="card">
      <div class="card-head"><i class="bi bi-type"></i> Detected Fonts <span class="badge-cnt">${f.total}</span></div>
      ${f.fonts.map(font=>`<div class="font-row"><div><div class="font-name" style="font-family:'${this.e(font.name)}',sans-serif">${this.e(font.name)}</div><div class="font-meta">Weight: ${this.e(font.weights)}${font.google?` &nbsp;·&nbsp; <a href="${font.link}" target="_blank">Google Font ↗</a>`:''}</div></div><div style="display:flex;gap:.4rem;flex-wrap:wrap">${this.copyBtn(`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap');`,'Import')}${this.copyBtn(font.name,'Name')}</div></div>`).join('')}
    </div>`;
  },

  /* ── Compare Tab (inline) ── */
  tCompareUI() {
    return `
    <div class="compare-tab-wrap">
      <div class="section-page-header">
        <h3><i class="bi bi-arrow-left-right" style="color:var(--primary2)"></i> Compare Two Websites</h3>
        <p>Enter two URLs to scan and compare them side by side — SEO, DA/PA, ranking, keywords, tech stack, and more.</p>
      </div>
      <div class="compare-tab-inputs">
        <div class="compare-tab-col">
          <label class="compare-label">Site A</label>
          <div class="url-row" style="margin-bottom:0">
            <i class="bi bi-globe2 url-icon"></i>
            <input id="cmpUrlA" type="url" placeholder="https://site-a.com" autocomplete="off" spellcheck="false"/>
          </div>
        </div>
        <div class="compare-tab-vs">VS</div>
        <div class="compare-tab-col">
          <label class="compare-label">Site B</label>
          <div class="url-row" style="margin-bottom:0">
            <i class="bi bi-globe2 url-icon"></i>
            <input id="cmpUrlB" type="url" placeholder="https://site-b.com" autocomplete="off" spellcheck="false"/>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:1.25rem">
        <button class="scan-btn" id="cmpRunBtn" style="display:inline-flex">
          <i class="bi bi-arrow-left-right"></i><span>Compare Sites</span>
        </button>
      </div>
      <div id="cmpProgress" class="progress-box hidden" style="max-width:500px;margin:1.25rem auto 0">
        <div class="prog-track"><div id="cmpBar" class="prog-fill"></div></div>
        <div id="cmpLabel" class="prog-label">Scanning…</div>
      </div>
      <div id="cmpOutput" style="margin-top:1.75rem"></div>
    </div>`;
  },

  copy(val) { navigator.clipboard.writeText(val).then(()=>this.toast('Copied!')); },

  shareUrl(url) {
    if (navigator.share) {
      navigator.share({ title: 'MianScan Result', url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url).then(()=>this.toast('Share link copied!'));
    }
  },
  copyCSSVars(colors) {
    const css=`:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(()=>this.toast('CSS variables copied!'));
  },

  /* ══════════════════════════════════════════════════════════════════════════
   * v2.2 — Growth Score Tab
   * ══════════════════════════════════════════════════════════════════════════ */

  tGrowth(data) {
    const g = data.growth;
    if (!g) return this.empty('Growth score not available — rescan to generate.');

    const hostname = new URL(data.url).hostname.replace(/^www\./, '');

    const catMeta = {
      seo:           { label: 'SEO',               icon: 'graph-up-arrow',       color: 'var(--green)',    tab: 'seo' },
      performance:   { label: 'Performance',       icon: 'speedometer2',         color: 'var(--yellow)',   tab: 'performance' },
      mobile:        { label: 'Mobile',             icon: 'phone-fill',           color: 'var(--primary2)', tab: 'mobile' },
      security:      { label: 'Security',           icon: 'shield-lock-fill',     color: 'var(--red)',      tab: 'security' },
      accessibility: { label: 'Accessibility',     icon: 'universal-access',     color: 'var(--accent)',   tab: 'performance' },
      content:       { label: 'Content',            icon: 'file-text-fill',       color: 'var(--purple)',   tab: 'keywords' },
      conversion:    { label: 'Conversion',         icon: 'cursor-fill',          color: '#f59e0b',         tab: 'conversion' },
      ux:            { label: 'UX',                 icon: 'layout-text-window',   color: '#ec4899',         tab: 'overview' },
      business:      { label: 'Business Readiness', icon: 'building',             color: 'var(--accent)',   tab: 'business' },
    };

    const priorityMeta = {
      critical: { label: 'Fix Today',     color: 'var(--red)',      bg: 'rgba(240,68,68,.07)',    border: 'rgba(240,68,68,.22)',    icon: 'exclamation-octagon-fill',  impactColor: 'var(--red)' },
      high:     { label: 'Fix This Week', color: '#f59e0b',         bg: 'rgba(245,158,11,.07)',   border: 'rgba(245,158,11,.22)',   icon: 'exclamation-triangle-fill', impactColor: '#f59e0b' },
      medium:   { label: 'Improve Next',  color: 'var(--primary2)', bg: 'rgba(139,150,255,.07)',  border: 'rgba(139,150,255,.22)', icon: 'info-circle-fill',          impactColor: 'var(--primary2)' },
      low:      { label: 'Consider',      color: 'var(--muted)',    bg: 'rgba(122,143,168,.04)',  border: 'rgba(122,143,168,.14)',  icon: 'dot',                       impactColor: 'var(--muted)' },
      good:     { label: 'Passing',       color: 'var(--green)',    bg: 'rgba(34,197,94,.06)',    border: 'rgba(34,197,94,.18)',    icon: 'check-circle-fill',         impactColor: 'var(--green)' },
    };

    const gradeLabel = s => s>=90?'A':s>=80?'B':s>=65?'C':s>=50?'D':'F';
    const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--primary2)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
    const overallColor = scoreColor(g.overall);

    const critCount  = g.findings.filter(f => f.priority === 'critical').length;
    const highCount  = g.findings.filter(f => f.priority === 'high').length;
    const medCount   = g.findings.filter(f => f.priority === 'medium').length;
    const passCount  = g.findings.filter(f => f.priority === 'good').length;
    const issueCount = g.findings.filter(f => f.priority !== 'good').length;

    // ── 1. GROWTH SCORE HERO ───────────────────────────────────────────────
    const heroSection = `
    <div class="p2-hero">
      <div class="p2-hero-ring-col">
        <div class="p2-score-ring" style="border-color:${overallColor};color:${overallColor};box-shadow:0 0 48px ${overallColor}28">
          <span class="p2-score-val">${g.overall}</span>
          <span class="p2-score-sub">/ 100</span>
        </div>
        <div class="p2-score-grade" style="color:${overallColor}">${g.label}</div>
        <div class="p2-score-grade-letter" style="background:${overallColor}18;color:${overallColor}">Grade ${gradeLabel(g.overall)}</div>
      </div>
      <div class="p2-hero-body">
        <div class="p2-hero-headline">
          <i class="bi bi-graph-up-arrow" style="color:${overallColor}"></i>
          Website Growth Score
          <span class="p2-version-pill">v2.3</span>
        </div>
        <div class="p2-hero-domain">${this.e(hostname)}</div>
        <div class="p2-hero-summary">${this.e(g.summary)}</div>
        <div class="p2-hero-badges">
          ${critCount > 0 ? `<span class="p2-badge p2-badge-critical"><i class="bi bi-exclamation-octagon-fill"></i>${critCount} Critical</span>` : ''}
          ${highCount > 0 ? `<span class="p2-badge p2-badge-high"><i class="bi bi-exclamation-triangle-fill"></i>${highCount} High</span>` : ''}
          ${medCount  > 0 ? `<span class="p2-badge p2-badge-medium"><i class="bi bi-info-circle-fill"></i>${medCount} Medium</span>` : ''}
          <span class="p2-badge p2-badge-pass"><i class="bi bi-check-circle-fill"></i>${passCount} Passing</span>
        </div>
      </div>
    </div>`;

    // ── 2. CATEGORY SCORES ─────────────────────────────────────────────────
    const catGrid = `
    <div class="card p2-cats-card">
      <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Category Scores
        <span style="font-size:.72rem;font-weight:400;color:var(--muted);margin-left:.4rem">click any to explore</span>
      </div>
      <div class="p2-cat-grid">
        ${Object.entries(g.categories).map(([key, score]) => {
          const m   = catMeta[key];
          const c   = scoreColor(score);
          const gl  = gradeLabel(score);
          const glColor = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--primary2)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';
          const weakest = score < 50;
          return `
          <div class="p2-cat-card${weakest ? ' p2-cat-weak' : ''}"
               onclick="document.querySelector('[data-tab=${m.tab}]').click()" title="Open ${m.label} tab">
            <div class="p2-cat-top">
              <span class="p2-cat-icon" style="background:${m.color}18;color:${m.color}">
                <i class="bi bi-${m.icon}"></i>
              </span>
              <span class="p2-cat-label">${m.label}</span>
              <span class="p2-cat-grade" style="background:${glColor}18;color:${glColor}">${gl}</span>
            </div>
            <div class="p2-cat-score-row">
              <span class="p2-cat-score-num" style="color:${c}">${score}</span>
              <div class="p2-cat-bar-wrap">
                <div class="p2-cat-bar-fill" style="width:${score}%;background:${c}"></div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

    // ── 3. PRIORITY FINDINGS ───────────────────────────────────────────────
    const groupedFindings = {};
    ['critical','high','medium','low','good'].forEach(p => {
      const items = g.findings.filter(f => f.priority === p);
      if (items.length) groupedFindings[p] = items;
    });

    const effortIcon = e => {
      if (!e) return '';
      if (/easy/i.test(e)) return '<i class="bi bi-lightning-charge-fill" style="color:var(--green)"></i>';
      if (/medium/i.test(e)) return '<i class="bi bi-clock-fill" style="color:var(--yellow)"></i>';
      return '<i class="bi bi-tools" style="color:var(--red)"></i>';
    };

    const impactDot = imp => {
      if (!imp) return '';
      const c = imp === 'High' ? 'var(--red)' : imp === 'Medium' ? 'var(--yellow)' : 'var(--muted)';
      return `<span style="display:inline-flex;align-items:center;gap:.25rem;font-size:.72rem;font-weight:700;color:${c}"><span style="width:7px;height:7px;border-radius:50%;background:${c};flex-shrink:0;display:inline-block"></span>${imp} impact</span>`;
    };

    const findingsHtml = Object.entries(groupedFindings).map(([priority, items]) => {
      const pm = priorityMeta[priority];
      const isGood = priority === 'good';
      return `
      <div class="p2-priority-group">
        <div class="p2-priority-label" style="color:${pm.color}">
          <i class="bi bi-${pm.icon}"></i>
          ${pm.label}
          <span class="p2-priority-count" style="background:${pm.bg};border-color:${pm.border};color:${pm.color}">${items.length}</span>
        </div>
        ${items.map(f => `
        <div class="p2-finding${isGood ? ' p2-finding-good' : ''}" style="border-color:${pm.border}">
          <div class="p2-finding-head">
            <span class="p2-finding-cat" style="background:${pm.bg};color:${pm.color};border-color:${pm.border}">${f.category}</span>
            <span class="p2-finding-title">${this.e(f.title)}</span>
          </div>
          ${!isGood ? `
          <div class="p2-finding-why">${this.e(f.detail)}</div>
          <div class="p2-finding-fix" style="border-left-color:${pm.color}">
            <span class="p2-finding-fix-label">Recommended fix</span>
            ${this.e(f.action)}
          </div>
          <div class="p2-finding-meta">
            ${impactDot(f.impact)}
            ${f.effort ? `<span class="p2-finding-effort">${effortIcon(f.effort)}${this.e(f.effort)}</span>` : ''}
          </div>` : `
          <div class="p2-finding-detail-good">${this.e(f.detail)}</div>`}
        </div>`).join('')}
      </div>`;
    }).join('');

    const findingsSection = `
    <div class="card p2-findings-card">
      <div class="card-head">
        <i class="bi bi-clipboard2-pulse-fill"></i> Priority Findings
        <span class="p2-findings-meta">${issueCount} issue${issueCount !== 1 ? 's' : ''} · ${passCount} passing</span>
      </div>
      ${findingsHtml || this.empty('No findings — run a scan first')}
    </div>`;

    // ── 4. ACTION PLAN ─────────────────────────────────────────────────────
    const ap = g.actionPlan;
    const apSection = (ap.today.length || ap.thisWeek.length || ap.thisMonth.length) ? `
    <div class="card p2-ap-card">
      <div class="card-head"><i class="bi bi-calendar-check-fill"></i> Action Plan</div>
      <div class="p2-ap-grid">
        ${ap.today.length ? `
        <div class="p2-ap-col p2-ap-today">
          <div class="p2-ap-col-head"><i class="bi bi-lightning-charge-fill"></i> Do Today</div>
          ${ap.today.map(t => `
          <div class="p2-ap-item">
            <div class="p2-ap-item-title">${this.e(t.title || t)}</div>
            ${t.effort ? `<div class="p2-ap-item-effort">${this.e(t.effort)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${ap.thisWeek.length ? `
        <div class="p2-ap-col p2-ap-week">
          <div class="p2-ap-col-head"><i class="bi bi-calendar-week-fill"></i> This Week</div>
          ${ap.thisWeek.map(t => `
          <div class="p2-ap-item">
            <div class="p2-ap-item-title">${this.e(t.title || t)}</div>
            ${t.effort ? `<div class="p2-ap-item-effort">${this.e(t.effort)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${ap.thisMonth.length ? `
        <div class="p2-ap-col p2-ap-month">
          <div class="p2-ap-col-head"><i class="bi bi-calendar-month-fill"></i> This Month</div>
          ${ap.thisMonth.map(t => `
          <div class="p2-ap-item">
            <div class="p2-ap-item-title">${this.e(t.title || t)}</div>
            ${t.effort ? `<div class="p2-ap-item-effort">${this.e(t.effort)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>` : '';

    // ── 5. MULTIMIAN CTA — always shown, copy varies by score ─────────────
    const ctaCopy = (() => {
      if (critCount >= 3) return {
        headline: `Your website may be losing customers right now.`,
        sub: `${critCount} critical issues are directly blocking leads and search visibility. MultiMian fixes these for you — fast.`,
        btn: 'Get a Free Growth Review →',
      };
      if (critCount > 0 || highCount >= 3) return {
        headline: `Your website has clear growth opportunities.`,
        sub: `We found ${critCount + highCount} issues that are holding back traffic and conversions. MultiMian can build you a plan and implement it.`,
        btn: 'Talk to MultiMian →',
      };
      if (g.overall >= 80) return {
        headline: `Strong foundation — ready to scale?`,
        sub: `Your website is performing well. MultiMian can help you go further with advanced SEO, conversion optimisation, and growth campaigns.`,
        btn: 'Explore Growth Services →',
      };
      return {
        headline: `Want someone to handle all of this for you?`,
        sub: `MultiMian is a web development and SEO agency that builds websites that actually grow your business.`,
        btn: 'See What MultiMian Does →',
      };
    })();

    const mmCTA = `
    <div class="p2-mm-cta">
      <div class="p2-mm-cta-inner">
        <div class="p2-mm-cta-icon"><i class="bi bi-stars"></i></div>
        <div class="p2-mm-cta-body">
          <div class="p2-mm-cta-headline">${ctaCopy.headline}</div>
          <div class="p2-mm-cta-sub">${ctaCopy.sub}</div>
        </div>
        <a href="https://multimian.com" target="_blank" rel="noopener" class="p2-mm-cta-btn">
          ${ctaCopy.btn}
        </a>
      </div>
    </div>`;

    return heroSection + catGrid + findingsSection + apSection + mmCTA;
  },

  /* ── Business Readiness Tab ── */
  tBusiness(data) {
    const biz = data.business;
    if (!biz) return this.empty('Business Readiness data not available — rescan to generate.');

    const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--primary2)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
    const gradeColor = scoreColor(biz.score);
    const gradeLabel = biz.score >= 80 ? 'Business-Ready' : biz.score >= 65 ? 'Nearly There' : biz.score >= 50 ? 'Needs Work' : 'Not Ready';
    const gradeDesc  = biz.score >= 80
      ? 'This website presents a credible, well-rounded business presence.'
      : biz.score >= 65
      ? 'Good foundations — a few gaps are reducing visitor confidence.'
      : biz.score >= 50
      ? 'Several important trust and contact elements are missing.'
      : 'This website is missing most signals visitors need to trust and contact you.';

    // ── Audit item definitions: label → why + impact + fix ────────────────
    const auditDefs = {
      // Identity
      'Brand / Business Name':     { why: 'Your brand name is the first thing visitors notice. Without a clear identity, visitors can\'t remember or recommend you.', impact: 'Low', fix: 'Ensure your business name is in the page <title> and visible in the header logo or text.' },
      'Services / Products':       { why: 'Visitors need to know within 5 seconds what you do. Unclear offerings drive people straight to competitors.', impact: 'High', fix: 'Add a clear "What we do" or services section near the top of the page.' },
      'About / Team':              { why: 'Businesses with visible team members or company story convert 33% better. People buy from people.', impact: 'Medium', fix: 'Add an About section or page with your story, values, or team photos.' },
      // Contact
      'Email Address':             { why: 'Email is the most trusted contact method. Without it, many visitors won\'t bother looking for another way to reach you.', impact: 'High', fix: 'Add your email address in the header or footer — visible on every page.' },
      'Phone Number':              { why: 'A phone number builds immediate trust. For service businesses it can double enquiry rates.', impact: 'High', fix: 'Add a clickable phone number (tel: link) to your header or contact section.' },
      'WhatsApp':                  { why: 'WhatsApp is the #1 contact channel in many markets. A direct link removes friction for mobile visitors.', impact: 'Medium', fix: 'Add a wa.me link to your contact section or footer.' },
      'Contact Page':              { why: 'A dedicated contact page is expected by professional buyers and agencies. Without it, credibility drops.', impact: 'Medium', fix: 'Create a /contact page and link it in your navigation and footer.' },
      'Contact Form':              { why: 'Forms convert passive visitors into leads. They\'re lower friction than email for many users.', impact: 'High', fix: 'Add a simple enquiry form: name, email, message. A free tool like Tally or Formspree works instantly.' },
      // Trust
      'Testimonials / Reviews':    { why: 'Testimonials are the single most powerful conversion tool on a business website. Removing doubt = more enquiries.', impact: 'High', fix: 'Add 3–5 client testimonials with full names and photos above the fold or on your homepage.' },
      'Client Logos':              { why: '"Trusted by" sections with client logos provide instant authority — especially for agency and B2B sites.', impact: 'Medium', fix: 'Add a logo grid of past clients or partners with a "Trusted by" heading.' },
      'Social Proof Numbers':      { why: 'Numbers like "200+ clients" or "4.9 stars" create quantified credibility that copy alone can\'t match.', impact: 'Medium', fix: 'Add a metrics bar: number of clients, projects completed, years in business, or star rating.' },
      'Case Studies / Portfolio':  { why: 'Demonstrated results are more persuasive than any claim. For service businesses, a case study beats a testimonial.', impact: 'Medium', fix: 'Add at least one case study: client problem → your solution → measurable result.' },
      // Content
      'Pricing Information':       { why: 'Hidden pricing forces visitors to enquire before they\'re ready — most won\'t. Transparency increases qualified leads.', impact: 'Medium', fix: 'Add a pricing page or at least starting-from prices. If custom, explain what factors affect the price.' },
      'FAQ Section':               { why: 'FAQs pre-handle objections and reduce time-wasting enquiries. They also help SEO with long-tail keywords.', impact: 'Low', fix: 'Add 5–8 FAQs your prospects ask most. Structure them with schema markup for rich results.' },
      'Location / Area Served':    { why: 'For local and regional businesses, location signals drive local SEO and build relevance with nearby customers.', impact: 'Low', fix: 'Mention your city, country, or "serving [region]" in your content or footer.' },
      // Legal
      'Privacy Policy':            { why: 'A privacy policy is a legal requirement in most jurisdictions (GDPR, CCPA). Missing one exposes you to legal risk and reduces trust.', impact: 'High', fix: 'Add a privacy policy page and link it in your footer. Generate one free at termly.io.' },
      'Terms of Service':          { why: 'Terms of service protect both you and your customers and signal a professional, established business.', impact: 'Low', fix: 'Add a terms page and link it in the footer alongside your privacy policy.' },
      'Organization Schema':       { why: 'Schema markup tells Google exactly what your business does, enabling rich results and improving local search visibility.', impact: 'Medium', fix: 'Add Organization or LocalBusiness JSON-LD schema to your homepage <head>.' },
      'Social Media Presence':     { why: 'Social links build omnichannel trust and allow visitors to verify your business is active and legitimate.', impact: 'Low', fix: 'Add links to your active social profiles in the footer. Focus on 2–3 platforms your audience uses.' },
    };

    // ── Section metadata ───────────────────────────────────────────────────
    const sectionMeta = {
      Identity: { icon: 'person-badge-fill',    color: 'var(--primary2)', desc: 'How clearly you communicate who you are' },
      Contact:  { icon: 'telephone-fill',        color: 'var(--accent)',   desc: 'How easy it is for visitors to reach you' },
      Trust:    { icon: 'shield-check',           color: 'var(--green)',    desc: 'Evidence that backs up your claims' },
      Content:  { icon: 'file-text-fill',         color: 'var(--yellow)',   desc: 'Information visitors need to decide' },
      Legal:    { icon: 'file-earmark-lock-fill', color: 'var(--red)',      desc: 'Legal compliance and professional credibility' },
      Schema:   { icon: 'braces',                 color: 'var(--purple)',   desc: 'Structured data for search engines' },
      Social:   { icon: 'share-fill',             color: '#ec4899',         desc: 'Presence across platforms' },
    };

    // ── Group checks by section ────────────────────────────────────────────
    const grouped = {};
    (biz.checks || []).forEach(c => {
      const s = c.section || 'Other';
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(c);
    });

    // ── Quick signals bar (top overview) ──────────────────────────────────
    const signals = [
      { label: 'Email',        ok: biz.hasEmail,        icon: 'envelope-fill' },
      { label: 'Phone',        ok: biz.hasPhone,        icon: 'telephone-fill' },
      { label: 'Testimonials', ok: biz.hasTestimonials, icon: 'chat-quote-fill' },
      { label: 'Pricing',      ok: biz.hasPricing,      icon: 'tag-fill' },
      { label: 'Privacy',      ok: biz.hasPrivacy,      icon: 'shield-check' },
      { label: 'Case Studies', ok: biz.hasCaseStudies,  icon: 'briefcase-fill' },
      { label: 'Schema',       ok: biz.hasOrgSchema,    icon: 'braces' },
      { label: 'Social',       ok: biz.hasSocial,       icon: 'share-fill' },
    ];

    const passCount = signals.filter(s => s.ok).length;
    const failCount = signals.filter(s => !s.ok).length;

    // ── Section audit cards ────────────────────────────────────────────────
    const impactColor = i => i === 'High' ? 'var(--red)' : i === 'Medium' ? 'var(--yellow)' : 'var(--muted)';
    const impactBg    = i => i === 'High' ? 'rgba(240,68,68,.1)' : i === 'Medium' ? 'rgba(245,158,11,.1)' : 'rgba(122,143,168,.08)';

    const sectionCards = Object.entries(grouped).map(([sec, items]) => {
      const sm   = sectionMeta[sec] || { icon: 'list-check', color: 'var(--muted)', desc: '' };
      const fails = items.filter(c => c.type !== 'ok');
      const passes = items.filter(c => c.type === 'ok');
      return `
      <div class="p3-audit-section">
        <div class="p3-section-head" style="border-left-color:${sm.color}">
          <span class="p3-section-icon" style="background:${sm.color}18;color:${sm.color}"><i class="bi bi-${sm.icon}"></i></span>
          <div class="p3-section-title-col">
            <span class="p3-section-title">${sec}</span>
            <span class="p3-section-desc">${sm.desc}</span>
          </div>
          <div class="p3-section-tally">
            <span class="p3-tally-pass">${passes.length} ✓</span>
            ${fails.length ? `<span class="p3-tally-fail">${fails.length} ✗</span>` : ''}
          </div>
        </div>
        ${items.map(c => {
          const def  = auditDefs[c.label] || {};
          const isOk = c.type === 'ok';
          return `
          <div class="p3-audit-item${isOk ? ' p3-audit-ok' : ' p3-audit-fail'}">
            <div class="p3-audit-item-head">
              <i class="bi bi-${isOk ? 'check-circle-fill' : 'x-circle-fill'}" style="color:${isOk ? 'var(--green)' : 'var(--red)'}"></i>
              <span class="p3-audit-label">${this.e(c.label)}</span>
              ${!isOk && def.impact ? `<span class="p3-impact-badge" style="background:${impactBg(def.impact)};color:${impactColor(def.impact)}">${def.impact} impact</span>` : ''}
            </div>
            <div class="p3-audit-status">${this.e(c.msg)}</div>
            ${!isOk && def.why ? `
            <div class="p3-audit-why">
              <span class="p3-audit-why-label">Why it matters</span>
              ${this.e(def.why)}
            </div>` : ''}
            ${!isOk && def.fix ? `
            <div class="p3-audit-fix">
              <span class="p3-audit-fix-label">Recommended fix</span>
              ${this.e(def.fix)}
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
    }).join('');

    // ── MultiMian CTA copy driven by score ────────────────────────────────
    const ctaCopy = biz.score < 50
      ? { headline: 'This website is losing potential customers.', sub: `${failCount} business readiness signals are missing. MultiMian can audit, fix, and grow your website.`, btn: 'Get a Free Business Audit →' }
      : biz.score < 70
      ? { headline: 'A few fixes could significantly increase enquiries.', sub: 'Your business presence has good bones — targeted improvements to trust and contact signals can make a big difference.', btn: 'Talk to MultiMian →' }
      : { headline: 'Strong business presence — ready to scale?', sub: 'MultiMian helps growing businesses convert more visitors into clients through SEO, conversion optimisation, and web development.', btn: 'Explore Growth Services →' };

    return `
    <!-- ── Overview Hero ── -->
    <div class="p3-biz-hero">
      <div class="p3-biz-hero-ring-col">
        <div class="score-ring" style="border-color:${gradeColor};color:${gradeColor};width:96px;height:96px;font-size:1.7rem">${biz.score}</div>
        <div style="font-weight:800;font-size:.9rem;color:${gradeColor};margin-top:.4rem">${gradeLabel}</div>
        <div style="font-size:.75rem;color:var(--muted)">Grade ${biz.grade}</div>
      </div>
      <div class="p3-biz-hero-body">
        <div class="p3-biz-hero-title"><i class="bi bi-building" style="color:${gradeColor}"></i> Business Readiness Audit</div>
        <div class="p3-biz-hero-desc">${this.e(gradeDesc)}</div>
        <div class="p3-signals-bar">
          ${signals.map(s => `
          <div class="p3-signal${s.ok ? ' p3-signal-ok' : ' p3-signal-fail'}">
            <i class="bi bi-${s.icon}"></i>
            <span>${s.label}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- ── Section Audit Cards ── -->
    <div class="p3-audit-cards">
      ${sectionCards}
    </div>

    <!-- ── MultiMian CTA ── -->
    <div class="p3-tab-cta">
      <div class="p3-tab-cta-inner">
        <div class="p3-tab-cta-icon"><i class="bi bi-award-fill"></i></div>
        <div class="p3-tab-cta-body">
          <div class="p3-tab-cta-headline">${ctaCopy.headline}</div>
          <div class="p3-tab-cta-sub">${ctaCopy.sub}</div>
        </div>
        <a href="https://multimian.com" target="_blank" rel="noopener" class="p3-tab-cta-btn">${ctaCopy.btn}</a>
      </div>
    </div>`;
  },

  /* ── Conversion Intelligence Tab ── */
  tConversion(data) {
    const cv = data.conversion;
    if (!cv) return this.empty('Conversion data not available — rescan to generate.');

    const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--primary2)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
    const gradeColor = scoreColor(cv.score);
    const gradeLabel = cv.score >= 80 ? 'Conversion-Optimised' : cv.score >= 65 ? 'Good Potential' : cv.score >= 50 ? 'Needs Work' : 'Low Conversion';
    const gradeDesc  = cv.score >= 80
      ? 'Your website is well-set up to turn visitors into leads and customers.'
      : cv.score >= 65
      ? 'Good foundations — targeted improvements could meaningfully increase enquiry rate.'
      : cv.score >= 50
      ? 'Several conversion elements are missing or weak. Visitors may not know what to do next.'
      : 'This website is unlikely to convert most visitors. Core conversion elements need attention urgently.';

    // ── Audit definitions per check label ─────────────────────────────────
    const auditDefs = {
      'Primary CTA':              { why: 'Without a clear call-to-action, visitors have no obvious next step. This is the single biggest conversion killer on business websites.', impact: 'High', fix: 'Add one dominant CTA above the fold: "Get Started", "Book a Free Call", or "Request a Quote". Make it visually distinct.' },
      'CTA Visibility':           { why: 'Most visitors never scroll below the fold on a first visit. If your CTA isn\'t visible immediately, many will leave before seeing it.', impact: 'High', fix: 'Move your primary CTA to the hero section — above the fold on both desktop and mobile.' },
      'CTA Clarity':              { why: 'Vague CTAs like "Click Here" or "Learn More" convert at a fraction of the rate of action-oriented alternatives.', impact: 'Medium', fix: 'Use action verbs: Get, Start, Book, Request, Download, Join. Be specific about what happens next.' },
      'CTA Repetition':           { why: 'A CTA appearing only once gets missed by most visitors. Repeating it at logical intervals captures visitors who are ready at different stages.', impact: 'Medium', fix: 'Add your primary CTA in the hero, mid-page (after value section), and at the bottom of the page.' },
      'CTA Focus':                { why: 'Too many competing CTAs create decision paralysis — visitors take no action when unsure which step to take.', impact: 'Medium', fix: 'Identify your single most important action. Make it visually dominant. Demote or remove secondary CTAs.' },
      'Contact Form':             { why: 'Forms are the lowest-friction conversion path. They capture leads 24/7 without requiring real-time availability.', impact: 'High', fix: 'Add a simple enquiry form: name, email, message, submit. Free options: Tally, Formspree, or HubSpot Free.' },
      'Newsletter / Email Opt-in':{ why: 'Email lists convert at 3–5× the rate of social followers. An opt-in captures visitors who are interested but not ready to buy yet.', impact: 'Medium', fix: 'Add a newsletter signup with a value hook: "Get weekly tips on [your topic]" or a free resource offer.' },
      'Lead Magnet / Free Resource':{ why: 'A free resource (guide, checklist, template) dramatically increases opt-in rates by giving visitors an immediate reason to share their email.', impact: 'Medium', fix: 'Create a simple PDF guide or template relevant to your audience and offer it in exchange for an email.' },
      'Email Address':            { why: 'An email address is the most trusted contact signal. Many visitors will leave if they can\'t see how to reach you directly.', impact: 'High', fix: 'Display your email visibly in the header or footer. Use a mailto: link for clickability on mobile.' },
      'Phone Number':             { why: 'A phone number dramatically increases trust for service businesses. Many prospects prefer to call rather than fill a form.', impact: 'High', fix: 'Add a clickable phone number (tel: link) in your header. Keep it visible on mobile.' },
      'WhatsApp':                 { why: 'WhatsApp is the dominant mobile contact method in many markets. A direct link removes friction for mobile-first audiences.', impact: 'Medium', fix: 'Add a wa.me/YOURNUMBER link in your contact section and consider a floating WhatsApp button.' },
      'Contact Page':             { why: 'B2B buyers and agencies expect a dedicated contact page. Without it, credibility is reduced and enquiries decrease.', impact: 'Medium', fix: 'Create a /contact page with your email, phone, form, and location. Link it in the nav and footer.' },
      'Testimonials / Reviews':   { why: 'Testimonials are the most effective trust signal on a website. They reduce buying risk and answer the question "does this actually work?"', impact: 'High', fix: 'Add 3–5 testimonials with real names and ideally photos. Position the best one in the hero section.' },
      'Social Proof Numbers':     { why: 'Specific numbers ("200+ clients", "4.9/5 stars") create credibility that copy can\'t. They show scale and real adoption.', impact: 'Medium', fix: 'Add a metrics bar with your best numbers: clients served, years in business, projects completed, star rating.' },
      'Client Logos':             { why: 'A "Trusted by" section with recognisable logos shortens the sales cycle — especially for B2B and agency services.', impact: 'Medium', fix: 'Add a logo strip of 6–12 past clients or brands you\'ve worked with under a "Trusted by" heading.' },
      'Guarantee / Risk Reversal':{ why: 'Risk-reversal language removes the biggest objection to buying: fear of regret. It dramatically increases conversion for unfamiliar businesses.', impact: 'Medium', fix: 'Add language like "14-day money-back guarantee", "No contract, cancel anytime", or "Risk-free trial".' },
      'Pricing Transparency':     { why: 'Hidden pricing forces visitors to enquire before they\'re ready. Most won\'t — they\'ll go to a competitor with visible pricing instead.', impact: 'Medium', fix: 'Add pricing or at minimum a "starting from" price. If truly custom, explain what factors affect cost.' },
      'Navigation Clarity':       { why: 'Cluttered navigation overwhelms visitors and dilutes focus. The more options, the less likely any single path gets taken.', impact: 'Low', fix: 'Reduce navigation to 5–7 core links. Move secondary pages to the footer.' },
    };

    // ── Section metadata ───────────────────────────────────────────────────
    const sectionMeta = {
      CTA:        { icon: 'cursor-fill',     color: 'var(--primary2)', desc: 'How clearly you direct visitors to take action' },
      'Lead Gen': { icon: 'funnel-fill',     color: 'var(--accent)',   desc: 'How you capture leads and build your list' },
      Contact:    { icon: 'telephone-fill',  color: 'var(--green)',    desc: 'How easy it is for visitors to reach you' },
      Trust:      { icon: 'shield-check',    color: '#f59e0b',         desc: 'Evidence that reduces doubt and builds confidence' },
      Navigation: { icon: 'compass-fill',    color: 'var(--muted)',    desc: 'How clearly visitors can find their way' },
    };

    const impactColor = i => i === 'High' ? 'var(--red)' : i === 'Medium' ? 'var(--yellow)' : 'var(--muted)';
    const impactBg    = i => i === 'High' ? 'rgba(240,68,68,.1)' : i === 'Medium' ? 'rgba(245,158,11,.1)' : 'rgba(122,143,168,.08)';

    // ── Sub-scores overview ────────────────────────────────────────────────
    const subScores = [
      { label: 'CTA',      score: cv.ctaSectionScore     ?? 0, icon: 'cursor-fill',    color: 'var(--primary2)' },
      { label: 'Lead Gen', score: cv.leadSectionScore    ?? 0, icon: 'funnel-fill',    color: 'var(--accent)' },
      { label: 'Contact',  score: cv.contactSectionScore ?? 0, icon: 'telephone-fill', color: 'var(--green)' },
      { label: 'Trust',    score: cv.trustSectionScore   ?? 0, icon: 'shield-check',   color: '#f59e0b' },
    ];

    // ── Group checks by section ────────────────────────────────────────────
    const grouped = {};
    (cv.checks || []).forEach(c => {
      const s = c.section || 'Other';
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(c);
    });

    const sectionCards = Object.entries(grouped).map(([sec, items]) => {
      const sm    = sectionMeta[sec] || { icon: 'list-check', color: 'var(--muted)', desc: '' };
      const fails = items.filter(c => c.type !== 'ok');
      const passes = items.filter(c => c.type === 'ok');
      return `
      <div class="p3-audit-section">
        <div class="p3-section-head" style="border-left-color:${sm.color}">
          <span class="p3-section-icon" style="background:${sm.color}18;color:${sm.color}"><i class="bi bi-${sm.icon}"></i></span>
          <div class="p3-section-title-col">
            <span class="p3-section-title">${sec}</span>
            <span class="p3-section-desc">${sm.desc}</span>
          </div>
          <div class="p3-section-tally">
            <span class="p3-tally-pass">${passes.length} ✓</span>
            ${fails.length ? `<span class="p3-tally-fail">${fails.length} ✗</span>` : ''}
          </div>
        </div>
        ${items.map(c => {
          const def  = auditDefs[c.label] || {};
          const isOk = c.type === 'ok';
          return `
          <div class="p3-audit-item${isOk ? ' p3-audit-ok' : ' p3-audit-fail'}">
            <div class="p3-audit-item-head">
              <i class="bi bi-${isOk ? 'check-circle-fill' : 'x-circle-fill'}" style="color:${isOk ? 'var(--green)' : 'var(--red)'}"></i>
              <span class="p3-audit-label">${this.e(c.label)}</span>
              ${!isOk && def.impact ? `<span class="p3-impact-badge" style="background:${impactBg(def.impact)};color:${impactColor(def.impact)}">${def.impact} impact</span>` : ''}
            </div>
            <div class="p3-audit-status">${this.e(c.msg)}</div>
            ${!isOk && def.why ? `
            <div class="p3-audit-why">
              <span class="p3-audit-why-label">Why it matters</span>
              ${this.e(def.why)}
            </div>` : ''}
            ${!isOk && def.fix ? `
            <div class="p3-audit-fix">
              <span class="p3-audit-fix-label">Recommended fix</span>
              ${this.e(def.fix)}
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
    }).join('');

    // ── MultiMian CTA ──────────────────────────────────────────────────────
    const hasNoContact = !cv.hasEmail && !cv.hasPhone && !cv.hasContactPg;
    const ctaCopy = !cv.hasPrimaryCTA || hasNoContact
      ? { headline: 'Visitors can\'t convert — there\'s nothing to click or contact.', sub: 'Missing CTAs and contact information are directly costing you leads. MultiMian can fix this fast.', btn: 'Get a Free Conversion Review →' }
      : cv.score < 60
      ? { headline: 'Your website is leaving money on the table.', sub: 'Conversion improvements can double or triple your enquiry rate without spending more on traffic.', btn: 'Talk to MultiMian →' }
      : { headline: 'Good conversion setup — want to optimise further?', sub: 'MultiMian specialises in conversion-focused web development and SEO that turns more visitors into clients.', btn: 'Explore Conversion Services →' };

    return `
    <!-- ── Score Hero ── -->
    <div class="p3-biz-hero">
      <div class="p3-biz-hero-ring-col">
        <div class="score-ring" style="border-color:${gradeColor};color:${gradeColor};width:96px;height:96px;font-size:1.7rem">${cv.score}</div>
        <div style="font-weight:800;font-size:.9rem;color:${gradeColor};margin-top:.4rem">${gradeLabel}</div>
        <div style="font-size:.75rem;color:var(--muted)">Grade ${cv.grade}</div>
      </div>
      <div class="p3-biz-hero-body">
        <div class="p3-biz-hero-title"><i class="bi bi-cursor-fill" style="color:${gradeColor}"></i> Conversion Intelligence Audit</div>
        <div class="p3-biz-hero-desc">${this.e(gradeDesc)}</div>
        <div class="p3-subscore-bar">
          ${subScores.map(s => {
            const sc = scoreColor(s.score);
            return `
            <div class="p3-subscore">
              <div class="p3-subscore-label"><i class="bi bi-${s.icon}" style="color:${s.color}"></i>${s.label}</div>
              <div class="p3-subscore-track">
                <div class="p3-subscore-fill" style="width:${s.score}%;background:${sc}"></div>
              </div>
              <div class="p3-subscore-val" style="color:${sc}">${s.score}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- ── Section Audit Cards ── -->
    <div class="p3-audit-cards">
      ${sectionCards}
    </div>

    <!-- ── MultiMian CTA ── -->
    <div class="p3-tab-cta">
      <div class="p3-tab-cta-inner">
        <div class="p3-tab-cta-icon"><i class="bi bi-graph-up-arrow"></i></div>
        <div class="p3-tab-cta-body">
          <div class="p3-tab-cta-headline">${ctaCopy.headline}</div>
          <div class="p3-tab-cta-sub">${ctaCopy.sub}</div>
        </div>
        <a href="https://multimian.com" target="_blank" rel="noopener" class="p3-tab-cta-btn">${ctaCopy.btn}</a>
      </div>
    </div>`;
  },
};
