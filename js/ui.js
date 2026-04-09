const UI = {
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  },

  renderOverview(data) {
    const { overview: o, colors, fonts, media, contacts, tech, seo, structure } = data;
    document.getElementById('overviewBanner').innerHTML = `
      <div class="ob-info">
        <div class="ob-title">${o.title}</div>
        <div class="ob-desc">${o.desc || 'No description found'}</div>
        <div class="ob-tags">
          <span class="ob-tag"><i class="bi bi-tag"></i> ${o.type}</span>
          <span class="ob-tag"><i class="bi bi-translate"></i> ${o.lang}</span>
          <span class="ob-tag"><i class="bi bi-layout-split"></i> ${o.sections} sections</span>
          <span class="ob-tag"><i class="bi bi-lightbulb"></i> ${o.topic}</span>
        </div>
      </div>`;

    const cards = [
      {icon:'🎨', val:colors.total,             label:'Colors'},
      {icon:'🔤', val:fonts.total,              label:'Fonts'},
      {icon:'🖼️', val:media.totalImages,        label:'Images'},
      {icon:'📧', val:contacts.emails.length,   label:'Emails'},
      {icon:'⚙️', val:tech.scriptsCount,        label:'Scripts'},
      {icon:'📊', val:seo.score+'/100',         label:'SEO Score'},
      {icon:'🔗', val:structure.counts.Links,   label:'Links'},
      {icon:'🛠️', val:tech.detected.length,     label:'Tech Found'},
    ];
    document.getElementById('summaryGrid').innerHTML = cards.map(c =>
      `<div class="s-card fade-up"><div class="s-icon">${c.icon}</div><div class="s-val">${c.val}</div><div class="s-label">${c.label}</div></div>`
    ).join('');
  },

  renderTab(tab, data) {
    const fn = {
      overview:    () => this._overview(data),
      colors:      () => this._colors(data.colors),
      fonts:       () => this._fonts(data.fonts),
      structure:   () => this._structure(data.structure),
      content:     () => this._content(data.content),
      cta:         () => this._cta(data.cta),
      seo:         () => this._seo(data.seo),
      media:       () => this._media(data.media),
      contacts:    () => this._contacts(data.contacts),
      tech:        () => this._tech(data.tech),
      performance: () => this._performance(data.performance),
    };
    document.getElementById('tabContent').innerHTML = `<div class="fade-up">${(fn[tab]||fn.overview)()}</div>`;
  },

  _row(lbl, val) {
    return `<div class="info-row"><span class="info-lbl">${lbl}</span><span class="info-val">${val}</span></div>`;
  },
  _check(lbl, pass) {
    return `<div class="check-row"><span class="check-lbl">${lbl}</span><span class="${pass?'pass':'fail'}">${pass?'<i class="bi bi-check-circle-fill"></i> Pass':'<i class="bi bi-x-circle-fill"></i> Fail'}</span></div>`;
  },
  _empty(msg) {
    return `<div class="empty"><i class="bi bi-inbox"></i>${msg}</div>`;
  },

  _overview(d) {
    return `<div class="row">
      <div class="col"><div class="card">
        <h5><i class="bi bi-info-circle"></i> Site Summary</h5>
        ${this._row('URL',`<a href="${d.url}" target="_blank" style="color:var(--primary);word-break:break-all">${d.url}</a>`)}
        ${this._row('Title', d.seo.title||'—')}
        ${this._row('Type', d.overview.type)}
        ${this._row('Language', d.overview.lang)}
        ${this._row('Sections', d.overview.sections)}
        ${this._row('Total Elements', d.structure.totalElements)}
        ${this._row('HTML Size', d.performance.htmlSizeKB+' KB')}
        ${this._row('Scanned', new Date(d.scannedAt).toLocaleString())}
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-shield-check"></i> Quick Checks</h5>
        ${this._check('Meta Title',       !!d.seo.title)}
        ${this._check('Meta Description', !!d.seo.metaDesc)}
        ${this._check('H1 Tag',           d.seo.h1s.length===1)}
        ${this._check('OG Tags',          !!d.seo.ogTitle)}
        ${this._check('Viewport Meta',    !!d.seo.viewport)}
        ${this._check('Images with Alt',  d.seo.noAlt===0)}
        ${this._check('Tech Detected',    d.tech.detected.length>0)}
        ${this._check('Contact Info',     d.contacts.emails.length>0||Object.keys(d.contacts.social).length>0)}
      </div></div>
    </div>`;
  },

  _colors(c) {
    if (!c.colors.length) return this._empty('No colors detected');
    return `
    <div class="card">
      <h5><i class="bi bi-palette"></i> Color Palette <span class="cnt">${c.total}</span></h5>
      <div class="color-grid">
        ${c.colors.map(hex=>`
          <div class="color-item" onclick="UI.copy('${hex}')" title="Copy ${hex}">
            <div class="swatch" style="background:${hex}"></div>
            <span class="hex">${hex}</span>
            <span class="hex" style="font-size:.6rem">${ColorAnalyzer.toRgb(hex)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <h5><i class="bi bi-code-slash"></i> CSS Variables</h5>
      <pre>:root {\n${c.colors.map((h,i)=>`  --color-${i+1}: ${h};`).join('\n')}\n}</pre>
      <button class="export-btn" style="margin-top:.75rem" onclick="UI.copyCSSVars(${JSON.stringify(c.colors)})">
        <i class="bi bi-clipboard"></i> Copy CSS Variables
      </button>
    </div>`;
  },

  _fonts(f) {
    if (!f.fonts.length) return this._empty('No custom fonts detected');
    return `<div class="card">
      <h5><i class="bi bi-type"></i> Detected Fonts <span class="cnt">${f.total}</span></h5>
      ${f.fonts.map(font=>`
        <div class="font-item">
          <div>
            <div class="font-preview" style="font-family:'${font.name}',sans-serif">${font.name}</div>
            <div class="font-meta">Weight: ${font.weights}${font.google?` · <a href="${font.link}" target="_blank">Google Font ↗</a>`:''}</div>
          </div>
          <button class="export-btn" onclick="UI.copy('@import url(\\'https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap\\');')">
            <i class="bi bi-clipboard"></i> Copy
          </button>
        </div>`).join('')}
    </div>`;
  },

  _structure(s) {
    return `<div class="row">
      <div class="col"><div class="card">
        <h5><i class="bi bi-diagram-3"></i> Layout Tree</h5>
        ${s.tree.map(item=>`
          <div class="tree-item">
            <i class="bi bi-${item.icon}"></i>
            <span>${item.label}</span>
            <span class="tree-count">${item.count}</span>
          </div>`).join('')}
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-bar-chart"></i> Element Counts</h5>
        ${Object.entries(s.counts).map(([k,v])=>`
          <div class="perf-row"><span class="perf-lbl">${k}</span><span class="perf-val">${v}</span></div>`).join('')}
      </div></div>
    </div>`;
  },

  _content(c) {
    return `<div class="row">
      <div class="col"><div class="card">
        <h5><i class="bi bi-card-heading"></i> Headings</h5>
        ${c.headings.length ? c.headings.map(h=>`<div class="list-item"><i class="bi bi-chevron-right"></i>${h}</div>`).join('') : this._empty('No headings found')}
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-lightbulb"></i> Topics</h5>
        ${c.topics.length ? c.topics.map(t=>`<div class="list-item"><i class="bi bi-dot"></i>${t}</div>`).join('') : this._empty('No topics extracted')}
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-tags"></i> Keywords</h5>
        <div class="tags">${c.keywords.map(k=>`<span class="tag">${k}</span>`).join('')}</div>
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-hash"></i> Meta Tags</h5>
        ${c.tags.length ? `<div class="tags">${c.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>` : this._empty('No meta keywords')}
      </div></div>
    </div>`;
  },

  _cta(cta) {
    const sec = (label, items, badge) => !items.length ? '' : `
      <div class="card">
        <h5><i class="bi bi-cursor"></i> ${label}</h5>
        ${items.map(t=>`<div class="cta-item"><span class="cta-badge ${badge}">${label.split(' ')[0]}</span>${t}</div>`).join('')}
      </div>`;
    return `
      ${sec('Primary CTA', cta.primary, '')}
      ${sec('Secondary CTA', cta.secondary, 'sec')}
      <div class="card">
        <h5><i class="bi bi-list-ul"></i> All Buttons / Links</h5>
        <div class="tags">${cta.all.map(t=>`<span class="tag">${t}</span>`).join('') || '<span style="color:var(--muted);font-size:.85rem">None found</span>'}</div>
      </div>`;
  },

  _seo(seo) {
    const cls = seo.score>=70?'good':seo.score>=50?'ok':'bad';
    const miss = v => v ? v : '<em style="color:var(--red)">Missing</em>';
    const none = v => v ? v : '<em style="color:var(--muted)">None</em>';
    return `<div class="row">
      <div class="col" style="max-width:220px;text-align:center">
        <div class="card">
          <h5><i class="bi bi-graph-up"></i> SEO Score</h5>
          <div class="score-ring ${cls}">${seo.score}</div>
          <p style="color:var(--muted);font-size:.83rem">${seo.score>=70?'Good':seo.score>=50?'Needs Work':'Poor'}</p>
          <p style="color:var(--muted);font-size:.78rem;margin-top:.5rem">${seo.imagesTotal} imgs · ${seo.withAlt} with alt · ${seo.noAlt} missing</p>
        </div>
      </div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-list-check"></i> Meta Tags</h5>
        ${this._row('Title',       miss(seo.title))}
        ${this._row('Description', miss(seo.metaDesc))}
        ${this._row('Keywords',    none(seo.metaKw))}
        ${this._row('Canonical',   none(seo.canonical))}
        ${this._row('OG Title',    none(seo.ogTitle))}
        ${this._row('OG Image',    seo.ogImage?`<a href="${seo.ogImage}" target="_blank" style="color:var(--primary)">View ↗</a>`:none(''))}
        ${this._row('Twitter Card',none(seo.twCard))}
        ${this._row('Viewport',    miss(seo.viewport))}
      </div></div>
      <div class="col" style="flex-basis:100%"><div class="card">
        <h5><i class="bi bi-type-h1"></i> Heading Tags</h5>
        ${seo.h1s.length
          ? seo.h1s.map(h=>`<div class="cta-item"><span class="cta-badge">H1</span>${h}</div>`).join('')
          : '<div class="a11y-item a11y-warn"><i class="bi bi-exclamation-triangle"></i> No H1 found</div>'}
        ${seo.h2s.map(h=>`<div class="cta-item"><span class="cta-badge sec">H2</span>${h}</div>`).join('')}
      </div></div>
    </div>`;
  },

  _media(media) {
    const ph = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='72'><rect fill='%23334155' width='105' height='72'/><text x='50%25' y='50%25' fill='%2394a3b8' text-anchor='middle' dy='.3em' font-size='11'>No Preview</text></svg>`;
    return `
    <div class="card">
      <h5><i class="bi bi-images"></i> Images <span class="cnt">${media.totalImages}</span></h5>
      ${media.images.length ? `
        <div class="media-grid">
          ${media.images.map(img=>`
            <div class="media-item" title="${img.alt||img.src}">
              <img src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.src='${ph}'">
              <div class="media-name">${img.alt||img.src.split('/').pop()||'image'}</div>
            </div>`).join('')}
        </div>` : this._empty('No images found')}
    </div>
    ${media.videos.length ? `<div class="card">
      <h5><i class="bi bi-play-circle"></i> Videos <span class="cnt">${media.totalVideos}</span></h5>
      ${media.videos.map(v=>`<div class="list-item"><i class="bi bi-play-fill"></i><a href="${v.src}" target="_blank">${v.src}</a></div>`).join('')}
    </div>` : ''}`;
  },

  _contacts(c) {
    const icons = {Twitter:'twitter',Facebook:'facebook',LinkedIn:'linkedin',Instagram:'instagram',YouTube:'youtube',GitHub:'github',WhatsApp:'whatsapp'};
    return `<div class="row">
      <div class="col"><div class="card">
        <h5><i class="bi bi-envelope"></i> Emails</h5>
        ${c.emails.length ? c.emails.map(e=>`<div class="list-item"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}">${e}</a></div>`).join('') : this._empty('No emails found')}
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-telephone"></i> Phone Numbers</h5>
        ${c.phones.length ? c.phones.map(p=>`<div class="list-item"><i class="bi bi-telephone-fill"></i><a href="tel:${p}">${p}</a></div>`).join('') : this._empty('No phone numbers found')}
      </div></div>
      <div class="col" style="flex-basis:100%"><div class="card">
        <h5><i class="bi bi-share"></i> Social Media</h5>
        ${Object.entries(c.social).length
          ? Object.entries(c.social).map(([k,url])=>`<div class="list-item"><i class="bi bi-${icons[k]||'link'}"></i><a href="${url}" target="_blank">${url}</a></div>`).join('')
          : this._empty('No social links found')}
      </div></div>
    </div>`;
  },

  _tech(tech) {
    return `
    <div class="card">
      <h5><i class="bi bi-cpu"></i> Detected Technologies <span class="cnt">${tech.detected.length}</span></h5>
      <div class="tech-wrap">
        ${tech.detected.length
          ? tech.detected.map(t=>`<span class="tech-badge"><span class="dot"></span>${t}</span>`).join('')
          : this._empty('No technologies detected')}
      </div>
    </div>
    <div class="card">
      <h5><i class="bi bi-file-code"></i> Script Sources <span class="cnt">${tech.scriptsCount}</span></h5>
      ${tech.scriptSrcs.length
        ? tech.scriptSrcs.map(s=>`<div class="list-item" style="font-size:.78rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all">${s}</span></div>`).join('')
        : this._empty('No external scripts')}
    </div>`;
  },

  _performance(p) {
    return `<div class="row">
      <div class="col"><div class="card">
        <h5><i class="bi bi-speedometer2"></i> Page Metrics</h5>
        <div class="perf-row"><span class="perf-lbl">HTML Size</span><span class="perf-val">${p.htmlSizeKB} KB</span></div>
        <div class="perf-row"><span class="perf-lbl">Scripts</span><span class="perf-val">${p.scriptsCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Stylesheets</span><span class="perf-val">${p.stylesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Images</span><span class="perf-val">${p.imagesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Iframes</span><span class="perf-val">${p.iframesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Inline Script Size</span><span class="perf-val">${p.inlineKB} KB</span></div>
      </div></div>
      <div class="col"><div class="card">
        <h5><i class="bi bi-universal-access"></i> Accessibility</h5>
        ${p.a11y.map(w=>`<div class="a11y-item ${w.ok?'a11y-ok':'a11y-warn'}"><i class="bi bi-${w.ok?'check-circle':'exclamation-triangle'}"></i>${w.msg}</div>`).join('')}
      </div></div>
    </div>`;
  },

  copy(val) {
    navigator.clipboard.writeText(val).then(() => this.toast('Copied: ' + val));
  },
  copyCSSVars(colors) {
    const css = `:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(() => this.toast('CSS variables copied!'));
  }
};
