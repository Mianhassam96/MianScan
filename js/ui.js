const UI = {
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  },

  e(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  copyBtn(val, label='Copy') {
    const safe = String(val).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<button class="copy-btn" onclick="UI.copy('${safe}')" title="Copy to clipboard"><i class="bi bi-clipboard"></i>${label}</button>`;
  },

  renderBanner(data) {
    const o = data.overview;
    document.getElementById('siteBanner').innerHTML = `
      <div class="sb-title">${this.e(o.title)}</div>
      <div class="sb-desc">${this.e(o.desc)||'<em style="opacity:.45">No description found</em>'}</div>
      <div class="sb-tags">
        <span class="sb-tag"><i class="bi bi-tag-fill"></i>${this.e(o.type)}</span>
        <span class="sb-tag"><i class="bi bi-translate"></i>${this.e(o.lang)}</span>
        <span class="sb-tag"><i class="bi bi-layout-split"></i>${o.sections} sections</span>
        <span class="sb-tag"><i class="bi bi-file-word"></i>${(data.content.wordCount||0).toLocaleString()} words</span>
        <span class="sb-tag"><i class="bi bi-lightbulb-fill"></i>${this.e(o.topic)}</span>
      </div>`;
  },

  renderStats(data) {
    const { colors, fonts, media, contacts, tech, seo, links, images } = data;
    const cards = [
      { icon:'📊', val:seo.score+'/100',          lbl:'SEO Score'  },
      { icon:'🔗', val:links.totalInternal,        lbl:'Int. Links' },
      { icon:'🌐', val:links.totalExternal,        lbl:'Ext. Links' },
      { icon:'🖼️', val:images.total,              lbl:'Images'     },
      { icon:'⚠️', val:images.missingAltCount,    lbl:'Missing Alt'},
      { icon:'🎨', val:colors.total,              lbl:'Colors'     },
      { icon:'🛠️', val:tech.detected.length,      lbl:'Tech Found' },
      { icon:'📧', val:contacts.emails.length,    lbl:'Emails'     },
    ];
    document.getElementById('statsRow').innerHTML = cards.map((c,i) =>
      `<div class="stat-card fu" style="animation-delay:${i*.05}s">
        <div class="stat-icon">${c.icon}</div>
        <div class="stat-val">${c.val}</div>
        <div class="stat-lbl">${c.lbl}</div>
      </div>`
    ).join('');
  },

  renderTab(tab, data) {
    const map = {
      overview:    () => this.tOverview(data),
      domain:      () => this.tDomain(data.domain, data.seo, data.overview),
      seo:         () => this.tSEO(data.seo),
      keywords:    () => this.tKeywords(data.content),
      links:       () => this.tLinks(data.links),
      images:      () => this.tImages(data.images),
      contacts:    () => this.tContacts(data.contacts),
      cta:         () => this.tCTA(data.cta),
      tech:        () => this.tTech(data.tech),
      colors:      () => this.tColors(data.colors),
      fonts:       () => this.tFonts(data.fonts),
      performance: () => this.tPerf(data.performance),
    };
    document.getElementById('tabContent').innerHTML =
      `<div class="fu">${(map[tab]||map.overview)()}</div>`;
  },

  /* helpers */
  irow(lbl, val) { return `<div class="irow"><span class="ilbl">${lbl}</span><span class="ival">${val}</span></div>`; },
  crow(lbl, pass) {
    return `<div class="crow"><span class="clbl">${lbl}</span>
      <span class="${pass?'pass':'fail'}"><i class="bi bi-${pass?'check-circle-fill':'x-circle-fill'}"></i>${pass?'Pass':'Fail'}</span></div>`;
  },
  empty(msg) { return `<div class="empty"><i class="bi bi-inbox"></i><p>${msg}</p></div>`; },
  miss(v)    { return v ? this.e(v) : '<em style="color:var(--red);font-style:normal">Missing</em>'; },
  none(v)    { return v ? this.e(v) : '<em style="color:var(--muted);font-style:normal">None</em>'; },
  warnRow(w) {
    const icon = w.type==='ok'?'check-circle-fill':w.type==='warn'?'exclamation-triangle-fill':'x-circle-fill';
    const cls  = w.type==='ok'?'a11y-ok':'a11y-warn';
    return `<div class="a11y-row ${cls}"><i class="bi bi-${icon}"></i>${w.msg}</div>`;
  },

  /* ── Overview ── */
  tOverview(d) {
    const comps = d.structure.components || [];
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-info-circle-fill"></i> Site Summary</div>
        ${this.irow('URL',      `<a href="${this.e(d.url)}" target="_blank" style="color:var(--primary2);word-break:break-all">${this.e(d.url)}</a>`)}
        ${this.irow('Title',    this.e(d.seo.title)||'—')}
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
        ${this.crow('Tech Detected',    d.tech.detected.length>0)}
        ${this.crow('Contact Info',     d.contacts.emails.length>0||Object.keys(d.contacts.social).length>0)}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-puzzle-fill"></i> Detected Components</div>
      <div class="comp-grid">
        ${comps.map(c=>`<div class="comp-item ${c.found?'comp-found':'comp-missing'}">
          <i class="bi bi-${c.found?'check-circle-fill':'x-circle'}"></i>${c.name}</div>`).join('')}
      </div>
    </div>`;
  },

  /* ── Domain ── */
  tDomain(d, seo, overview) {
    const score = seo.score;
    // Estimate PA from on-page SEO score (0-100 → 0-100 scale)
    const paEst = Math.min(100, Math.round(score * 0.85 + (seo.h1s.length===1?5:0) + (seo.canonical?5:0)));
    // DA from Open PageRank (0-10 scale) or estimate
    const daDisplay = d.da !== null ? `${d.da}/10 <small style="color:var(--muted)">(Open PageRank)</small>` : `~${Math.round(score/15)}/10 <small style="color:var(--muted)">(estimated)</small>`;
    const paDisplay = `${paEst}/100 <small style="color:var(--muted)">(estimated from on-page signals)</small>`;
    const rankDisplay = d.rank ? `#${Number(d.rank).toLocaleString()}` : '<em style="color:var(--muted)">Not available</em>';

    return `
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-globe-americas"></i> Domain Info</div>
        ${this.irow('Domain',    `<strong>${this.e(d.hostname)}</strong>`)}
        ${this.irow('Site Type', overview.type)}
        ${this.irow('Language',  overview.lang)}
        ${this.irow('Created',   d.age ? d.age : '<em style="color:var(--muted)">Unknown</em>')}
        ${this.irow('Registrar', d.registrar || '<em style="color:var(--muted)">Unknown</em>')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Authority Metrics</div>
        <div class="authority-grid">
          <div class="auth-card">
            <div class="auth-val" style="color:var(--primary2)">${d.da !== null ? d.da : '~'+Math.round(score/15)}</div>
            <div class="auth-lbl">Domain Authority</div>
            <div class="auth-note">${d.da !== null ? 'Open PageRank (0–10)' : 'Estimated'}</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--accent)">${paEst}</div>
            <div class="auth-lbl">Page Authority</div>
            <div class="auth-note">Estimated (0–100)</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--green)">${score}</div>
            <div class="auth-lbl">SEO Score</div>
            <div class="auth-note">On-page analysis</div>
          </div>
          <div class="auth-card">
            <div class="auth-val" style="color:var(--yellow);font-size:1rem">${d.rank ? '#'+Number(d.rank).toLocaleString() : 'N/A'}</div>
            <div class="auth-lbl">Global Rank</div>
            <div class="auth-note">Open PageRank</div>
          </div>
        </div>
        <div class="auth-note-box">
          <i class="bi bi-info-circle"></i>
          DA/PA are estimated metrics. For exact Moz DA/PA, use <a href="https://moz.com/link-explorer" target="_blank" style="color:var(--primary2)">Moz Link Explorer</a>.
        </div>
      </div>
    </div>`;
  },

  /* ── SEO ── */
  tSEO(seo) {
    const cls = seo.score>=70?'sg':seo.score>=50?'so':'sb';
    const grade = seo.score>=70?'Good':seo.score>=50?'Needs Work':'Poor';
    return `
    <div class="g2" style="align-items:start">
      <div class="card">
        <div class="card-head"><i class="bi bi-graph-up-arrow"></i> SEO Score</div>
        <div class="score-box">
          <div class="score-ring ${cls}">${seo.score}</div>
          <div class="score-grade">${grade}</div>
          <div class="score-sub">${seo.imagesTotal} images · ${seo.withAlt} with alt · ${seo.noAlt} missing</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-exclamation-triangle-fill"></i> SEO Checks</div>
        ${(seo.warnings||[]).map(w=>this.warnRow(w)).join('')}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-tags-fill"></i> Core Meta Tags</div>
        ${this.irow('Title',       this.miss(seo.title) + (seo.title ? ` <small style="color:var(--muted)">(${seo.title.length} chars)</small>` : ''))}
        ${this.irow('Description', this.miss(seo.metaDesc) + (seo.metaDesc ? ` <small style="color:var(--muted)">(${seo.metaDesc.length} chars)</small>` : ''))}
        ${this.irow('Keywords',    this.none(seo.metaKw))}
        ${this.irow('Canonical',   this.none(seo.canonical))}
        ${this.irow('Viewport',    this.miss(seo.viewport))}
        ${this.irow('Robots',      this.none(seo.allMeta?.find(m=>m.name==='robots')?.content))}
        ${this.irow('Author',      this.none(seo.allMeta?.find(m=>m.name==='author')?.content))}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-type-h1"></i> Heading Tags</div>
        ${seo.h1s.length
          ? seo.h1s.map(h=>`<div class="cta-row"><span class="cta-badge">H1</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')
          : '<div class="a11y-row a11y-warn"><i class="bi bi-exclamation-triangle-fill"></i> No H1 tag found</div>'}
        ${(seo.h2s||[]).map(h=>`<div class="cta-row"><span class="cta-badge sec">H2</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')}
        ${(seo.h3s||[]).map(h=>`<div class="cta-row"><span class="cta-badge" style="background:var(--bg4);color:var(--muted)">H3</span><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-share-fill"></i> Open Graph Tags</div>
        ${(seo.ogTags||[]).length
          ? (seo.ogTags||[]).map(t=>`${this.irow(this.e(t.property), this.e(t.content))}`).join('')
          : this.empty('No OG tags found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-twitter-x"></i> Twitter / X Tags</div>
        ${(seo.twitterTags||[]).length
          ? (seo.twitterTags||[]).map(t=>`${this.irow(this.e(t.name), this.e(t.content))}`).join('')
          : this.empty('No Twitter tags found')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-code-square"></i> All Meta Tags <span class="badge-cnt">${(seo.allMeta||[]).length}</span></div>
      <div style="overflow-x:auto">
        <table class="meta-table">
          <thead><tr><th>Name / Property</th><th>Content</th><th></th></tr></thead>
          <tbody>
            ${(seo.allMeta||[]).map(m=>`
              <tr>
                <td><code>${this.e(m.name)}</code></td>
                <td style="word-break:break-word;max-width:400px">${this.e(m.content)}</td>
                <td>${this.copyBtn(m.content)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  /* ── Keywords ── */
  tKeywords(content) {
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Keyword Density <span class="badge-cnt">${content.keywords.length}</span></div>
        <div class="kw-table">
          <div class="kw-header"><span>Keyword</span><span>Count</span><span>Density</span></div>
          ${content.keywords.map(k=>`
            <div class="kw-row">
              <span class="kw-word" onclick="UI.copy('${k.word}')" title="Click to copy">${this.e(k.word)}</span>
              <span class="kw-count">${k.count}</span>
              <span class="kw-density">
                <span class="kw-bar" style="width:${Math.min(parseFloat(k.density)*10,100)}%"></span>
                ${k.density}%
              </span>
            </div>`).join('')}
        </div>
        <button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${content.keywords.map(k=>k.word).join(', ')}')">
          <i class="bi bi-clipboard"></i> Copy All Keywords
        </button>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><i class="bi bi-lightbulb-fill"></i> Topics</div>
          ${content.topics.length
            ? content.topics.map(t=>`<div class="litem"><i class="bi bi-dot"></i><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join('')
            : this.empty('No topics extracted')}
        </div>
        <div class="card">
          <div class="card-head"><i class="bi bi-hash"></i> Meta Keywords</div>
          ${content.tags.length
            ? `<div class="tags">${content.tags.map(t=>`<span class="tag" onclick="UI.copy('${t}')" style="cursor:pointer">#${this.e(t)}</span>`).join('')}</div>
               <button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${content.tags.join(', ')}')"><i class="bi bi-clipboard"></i> Copy All</button>`
            : this.empty('No meta keywords')}
        </div>
        <div class="card">
          <div class="card-head"><i class="bi bi-card-heading"></i> Headings</div>
          ${content.headings.length
            ? content.headings.map(h=>`<div class="litem"><i class="bi bi-chevron-right"></i><span style="flex:1">${this.e(h)}</span>${this.copyBtn(h)}</div>`).join('')
            : this.empty('No headings found')}
        </div>
      </div>
    </div>`;
  },

  /* ── Links ── */
  tLinks(links) {
    const linkRow = l => `
      <div class="litem">
        <i class="bi bi-link-45deg"></i>
        <div style="flex:1;min-width:0">
          <div style="font-size:.82rem;word-break:break-all">${this.e(l.href)}</div>
          ${l.anchor ? `<div style="font-size:.72rem;color:var(--muted)">${this.e(l.anchor)}</div>` : ''}
        </div>
        ${this.copyBtn(l.href)}
      </div>`;
    return `
    <div class="stats-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon">🔗</div><div class="stat-val">${links.totalInternal}</div><div class="stat-lbl">Internal Links</div></div>
      <div class="stat-card"><div class="stat-icon">🌐</div><div class="stat-val">${links.totalExternal}</div><div class="stat-lbl">External Links</div></div>
      <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-val">${links.cta.length}</div><div class="stat-lbl">CTA Links</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-house-fill"></i> Internal Links <span class="badge-cnt">${links.internal.length}</span></div>
        ${links.internal.length ? links.internal.map(linkRow).join('') : this.empty('No internal links found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-box-arrow-up-right"></i> External Links <span class="badge-cnt">${links.external.length}</span></div>
        ${links.external.length ? links.external.map(linkRow).join('') : this.empty('No external links found')}
      </div>
    </div>
    ${links.cta.length ? `
    <div class="card">
      <div class="card-head"><i class="bi bi-cursor-fill"></i> CTA Links</div>
      ${links.cta.map(linkRow).join('')}
    </div>` : ''}`;
  },

  /* ── Images SEO ── */
  tImages(images) {
    const ph = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='108' height='76'><rect fill='%23162035' width='108' height='76'/><text x='50%25' y='50%25' fill='%237a8fa8' text-anchor='middle' dy='.3em' font-size='11' font-family='sans-serif'>No Preview</text></svg>`;
    return `
    <div class="stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.25rem">
      <div class="stat-card"><div class="stat-icon">🖼️</div><div class="stat-val">${images.total}</div><div class="stat-lbl">Total Images</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-val">${images.withAlt}</div><div class="stat-lbl">With Alt</div></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-val">${images.missingAltCount}</div><div class="stat-lbl">Missing Alt</div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-val">${images.lazyCount}</div><div class="stat-lbl">Lazy Load</div></div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-exclamation-triangle-fill"></i> Image SEO Issues</div>
        ${images.issues.map(w=>this.warnRow(w)).join('')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-exclamation-circle-fill"></i> Missing Alt Text <span class="badge-cnt">${images.missingAltCount}</span></div>
        ${images.missingAlt.length
          ? images.missingAlt.map(img=>`
              <div class="litem" style="font-size:.78rem">
                <i class="bi bi-image"></i>
                <span style="word-break:break-all;flex:1">${this.e(img.src.split('/').pop()||img.src)}</span>
                ${this.copyBtn(img.src)}
              </div>`).join('')
          : this.empty('All images have alt text ✓')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-images"></i> All Images <span class="badge-cnt">${images.total}</span></div>
      ${images.images.length ? `
        <div class="media-grid">
          ${images.images.map(img=>`
            <div class="media-card" title="${this.e(img.alt||img.src)}">
              <img src="${this.e(img.src)}" alt="${this.e(img.alt)}" loading="lazy" onerror="this.src='${ph}'">
              <div class="media-lbl-row">
                <span class="media-lbl ${img.hasAlt&&img.alt.trim()?'':'media-lbl-warn'}">${img.hasAlt&&img.alt.trim()?this.e(img.alt):'⚠ No alt'}</span>
                <button class="copy-btn-sm" onclick="UI.copy('${img.src.replace(/'/g,"\\'")}')"><i class="bi bi-clipboard"></i></button>
              </div>
            </div>`).join('')}
        </div>` : this.empty('No images found')}
    </div>`;
  },

  /* ── Contacts ── */
  tContacts(c) {
    const si = {Twitter:'twitter-x',Facebook:'facebook',LinkedIn:'linkedin',Instagram:'instagram',YouTube:'youtube',GitHub:'github',TikTok:'tiktok',Pinterest:'pinterest',Telegram:'telegram'};
    return `
    <div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-envelope-fill"></i> Email Addresses <span class="badge-cnt">${c.emails.length}</span></div>
        ${c.emails.length
          ? c.emails.map(e=>`<div class="litem"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}" style="flex:1">${e}</a>${this.copyBtn(e)}</div>`).join('')
          : this.empty('No emails found')}
        ${c.emails.length>1?`<button class="exp-btn" style="margin-top:.75rem" onclick="UI.copy('${c.emails.join('\\n')}')"><i class="bi bi-clipboard"></i> Copy All Emails</button>`:''}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-telephone-fill"></i> Phone Numbers <span class="badge-cnt">${c.phones.length}</span></div>
        ${c.phones.length
          ? c.phones.map(p=>`<div class="litem"><i class="bi bi-telephone-fill"></i><a href="tel:${p}" style="flex:1">${p}</a>${this.copyBtn(p)}</div>`).join('')
          : this.empty('No phone numbers found')}
      </div>
      ${c.whatsapp && c.whatsapp.length ? `
      <div class="card">
        <div class="card-head"><i class="bi bi-whatsapp"></i> WhatsApp Links <span class="badge-cnt">${c.whatsapp.length}</span></div>
        ${c.whatsapp.map(w=>`<div class="litem"><i class="bi bi-whatsapp"></i><a href="${this.e(w)}" target="_blank" style="flex:1">${this.e(w)}</a>${this.copyBtn(w)}</div>`).join('')}
      </div>` : ''}
      ${c.addresses && c.addresses.length ? `
      <div class="card">
        <div class="card-head"><i class="bi bi-geo-alt-fill"></i> Addresses</div>
        ${c.addresses.map(a=>`<div class="litem"><i class="bi bi-geo-alt-fill"></i><span style="flex:1">${this.e(a)}</span>${this.copyBtn(a)}</div>`).join('')}
      </div>` : ''}
      ${c.contactPage ? `
      <div class="card">
        <div class="card-head"><i class="bi bi-link-45deg"></i> Contact Page</div>
        <div class="litem"><i class="bi bi-link-45deg"></i><a href="${this.e(c.contactPage)}" target="_blank" style="flex:1">${this.e(c.contactPage)}</a>${this.copyBtn(c.contactPage)}</div>
      </div>` : ''}
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-share-fill"></i> Social Media Profiles</div>
      ${Object.entries(c.social).length
        ? Object.entries(c.social).map(([k,urls])=>
            (Array.isArray(urls)?urls:[urls]).map(url=>`
              <div class="litem">
                <i class="bi bi-${si[k]||'link-45deg'}"></i>
                <span class="social-platform">${k}</span>
                <a href="${this.e(url)}" target="_blank" style="flex:1;word-break:break-all">${this.e(url)}</a>
                ${this.copyBtn(url)}
              </div>`).join('')
          ).join('')
        : this.empty('No social links found')}
    </div>`;
  },

  /* ── CTAs ── */
  tCTA(cta) {
    const blk = (lbl, items, cls) => !items.length ? '' : `
      <div class="card">
        <div class="card-head"><i class="bi bi-cursor-fill"></i> ${lbl}</div>
        ${items.map(t=>`<div class="cta-row"><span class="cta-badge ${cls}">${lbl.split(' ')[0]}</span><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join('')}
      </div>`;
    return `
      ${blk('Primary CTA', cta.primary, '')}
      ${blk('Secondary CTA', cta.secondary, 'sec')}
      <div class="card">
        <div class="card-head"><i class="bi bi-list-ul"></i> All Buttons &amp; Links Found <span class="badge-cnt">${cta.all.length}</span></div>
        ${cta.all.map(t=>`<div class="cta-row"><span style="flex:1">${this.e(t)}</span>${this.copyBtn(t)}</div>`).join('')||this.empty('None found')}
        ${cta.all.length?`<button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${cta.all.join('\\n')}')"><i class="bi bi-clipboard"></i> Copy All</button>`:''}
      </div>`;
  },

  /* ── Tech ── */
  tTech(tech) {
    return `
    <div class="card">
      <div class="card-head"><i class="bi bi-cpu-fill"></i> Detected Technologies <span class="badge-cnt">${tech.detected.length}</span></div>
      <div class="tech-wrap">
        ${tech.detected.length
          ? tech.detected.map(t=>`<span class="tech-chip"><span class="tdot"></span>${this.e(t)}<button class="copy-btn-sm" onclick="UI.copy('${t}')"><i class="bi bi-clipboard"></i></button></span>`).join('')
          : this.empty('No technologies detected')}
      </div>
      ${tech.detected.length?`<button class="exp-btn" style="margin-top:.875rem" onclick="UI.copy('${tech.detected.join(', ')}')"><i class="bi bi-clipboard"></i> Copy All</button>`:''}
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-file-code-fill"></i> Script Sources <span class="badge-cnt">${tech.scriptsCount}</span></div>
      ${tech.scriptSrcs.length
        ? tech.scriptSrcs.map(s=>`<div class="litem" style="font-size:.78rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all;flex:1">${this.e(s)}</span>${this.copyBtn(s)}</div>`).join('')
        : this.empty('No external scripts')}
    </div>`;
  },

  /* ── Colors ── */
  tColors(c) {
    if (!c.colors.length) return this.empty('No colors detected');
    return `
    <div class="card">
      <div class="card-head"><i class="bi bi-palette-fill"></i> Color Palette <span class="badge-cnt">${c.total}</span></div>
      <div class="color-grid">
        ${c.colors.map(hex=>`
          <div class="color-item" onclick="UI.copy('${hex}')" title="Click to copy ${hex}">
            <div class="swatch" style="background:${hex}"></div>
            <span class="chex">${hex}</span>
            <span class="crgb">${ColorAnalyzer.toRgb(hex)}</span>
          </div>`).join('')}
      </div>
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
      ${f.fonts.map(font=>`
        <div class="font-row">
          <div>
            <div class="font-name" style="font-family:'${this.e(font.name)}',sans-serif">${this.e(font.name)}</div>
            <div class="font-meta">Weight: ${this.e(font.weights)}${font.google?` &nbsp;·&nbsp; <a href="${font.link}" target="_blank">Google Font ↗</a>`:''}</div>
          </div>
          <div style="display:flex;gap:.4rem;flex-wrap:wrap">
            ${this.copyBtn(`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap');`,'Import')}
            ${this.copyBtn(font.name,'Name')}
          </div>
        </div>`).join('')}
    </div>`;
  },

  /* ── Performance ── */
  tPerf(p) {
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-speedometer2"></i> Page Metrics</div>
        <div class="prow"><span class="plbl">HTML Size</span><span class="pval">${p.htmlSizeKB} KB</span></div>
        <div class="prow"><span class="plbl">Scripts</span><span class="pval">${p.scriptsCount}</span></div>
        <div class="prow"><span class="plbl">Stylesheets</span><span class="pval">${p.stylesCount}</span></div>
        <div class="prow"><span class="plbl">Images</span><span class="pval">${p.imagesCount}</span></div>
        <div class="prow"><span class="plbl">Iframes</span><span class="pval">${p.iframesCount}</span></div>
        <div class="prow"><span class="plbl">Inline Script Size</span><span class="pval">${p.inlineKB} KB</span></div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-universal-access"></i> Accessibility</div>
        ${p.a11y.map(w=>this.warnRow(w)).join('')}
      </div>
    </div>`;
  },

  copy(val) { navigator.clipboard.writeText(val).then(()=>this.toast('Copied!')); },
  copyCSSVars(colors) {
    const css = `:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(()=>this.toast('CSS variables copied!'));
  }
};
