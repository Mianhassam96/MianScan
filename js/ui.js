const UI = {
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  },

  renderOverview(data) {
    const { overview:o, colors, fonts, media, contacts, tech, seo, structure } = data;

    // Banner
    document.getElementById('overviewBanner').innerHTML = `
      <div class="ob-info">
        <div class="ob-title">${this._esc(o.title)}</div>
        <div class="ob-desc">${this._esc(o.desc) || '<em style="opacity:.5">No description found</em>'}</div>
        <div class="ob-tags">
          <span class="ob-tag"><i class="bi bi-tag-fill"></i>${o.type}</span>
          <span class="ob-tag"><i class="bi bi-translate"></i>${o.lang}</span>
          <span class="ob-tag"><i class="bi bi-layout-split"></i>${o.sections} sections</span>
          <span class="ob-tag"><i class="bi bi-lightbulb-fill"></i>${this._esc(o.topic)}</span>
        </div>
      </div>`;

    // Summary cards
    const cards = [
      { icon:'🎨', val:colors.total,              label:'Colors'    },
      { icon:'🔤', val:fonts.total,               label:'Fonts'     },
      { icon:'🖼️', val:media.totalImages,         label:'Images'    },
      { icon:'📧', val:contacts.emails.length,    label:'Emails'    },
      { icon:'⚙️', val:tech.scriptsCount,         label:'Scripts'   },
      { icon:'📊', val:seo.score + '/100',        label:'SEO Score' },
      { icon:'🔗', val:structure.counts.Links||0, label:'Links'     },
      { icon:'🛠️', val:tech.detected.length,      label:'Tech Found'},
    ];
    document.getElementById('summaryGrid').innerHTML = cards.map((c,i) =>
      `<div class="s-card fade-up" style="animation-delay:${i*0.05}s">
        <span class="s-icon">${c.icon}</span>
        <div class="s-val">${c.val}</div>
        <div class="s-label">${c.label}</div>
      </div>`
    ).join('');
  },

  renderTab(tab, data) {
    const map = {
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
    document.getElementById('tabContent').innerHTML =
      `<div class="fade-up">${(map[tab] || map.overview)()}</div>`;
  },

  /* ── helpers ── */
  _esc(s) { return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;') },
  _row(lbl, val) {
    return `<div class="info-row"><span class="info-lbl">${lbl}</span><span class="info-val">${val}</span></div>`;
  },
  _check(lbl, pass) {
    return `<div class="check-row">
      <span class="check-lbl">${lbl}</span>
      <span class="${pass?'pass':'fail'}">
        <i class="bi bi-${pass?'check-circle-fill':'x-circle-fill'}"></i>${pass?'Pass':'Fail'}
      </span>
    </div>`;
  },
  _empty(msg) {
    return `<div class="empty"><i class="bi bi-inbox"></i><p>${msg}</p></div>`;
  },
  _miss(v) { return v ? this._esc(v) : '<em style="color:var(--red);font-style:normal">Missing</em>' },
  _none(v) { return v ? this._esc(v) : '<em style="color:var(--muted);font-style:normal">None</em>' },

  /* ── Overview ── */
  _overview(d) {
    return `<div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="bi bi-info-circle-fill"></i> Site Summary</div>
        ${this._row('URL', `<a href="${d.url}" target="_blank" style="color:var(--primary2);word-break:break-all">${d.url}</a>`)}
        ${this._row('Title',    this._esc(d.seo.title)||'—')}
        ${this._row('Type',     d.overview.type)}
        ${this._row('Language', d.overview.lang)}
        ${this._row('Sections', d.overview.sections)}
        ${this._row('Elements', d.structure.totalElements.toLocaleString())}
        ${this._row('HTML Size',d.performance.htmlSizeKB + ' KB')}
        ${this._row('Scanned',  new Date(d.scannedAt).toLocaleString())}
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-shield-check"></i> Quick Checks</div>
        ${this._check('Meta Title',       !!d.seo.title)}
        ${this._check('Meta Description', !!d.seo.metaDesc)}
        ${this._check('H1 Tag',           d.seo.h1s.length === 1)}
        ${this._check('OG / Social Tags', !!d.seo.ogTitle)}
        ${this._check('Viewport Meta',    !!d.seo.viewport)}
        ${this._check('Images with Alt',  d.seo.noAlt === 0)}
        ${this._check('Tech Detected',    d.tech.detected.length > 0)}
        ${this._check('Contact Info',     d.contacts.emails.length > 0 || Object.keys(d.contacts.social).length > 0)}
      </div>
    </div>`;
  },

  /* ── Colors ── */
  _colors(c) {
    if (!c.colors.length) return this._empty('No colors detected on this page');
    return `
    <div class="card">
      <div class="card-title"><i class="bi bi-palette-fill"></i> Color Palette <span class="cnt">${c.total}</span></div>
      <div class="color-grid">
        ${c.colors.map(hex => `
          <div class="color-item" onclick="UI.copy('${hex}')" title="Click to copy ${hex}">
            <div class="swatch" style="background:${hex}"></div>
            <span class="hex">${hex}</span>
            <span class="hex-rgb">${ColorAnalyzer.toRgb(hex)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><i class="bi bi-code-slash"></i> CSS Variables</div>
      <pre>:root {\n${c.colors.map((h,i)=>`  --color-${i+1}: ${h};`).join('\n')}\n}</pre>
      <button class="export-btn" style="margin-top:.875rem" onclick="UI.copyCSSVars(${JSON.stringify(c.colors)})">
        <i class="bi bi-clipboard"></i> Copy CSS Variables
      </button>
    </div>`;
  },

  /* ── Fonts ── */
  _fonts(f) {
    if (!f.fonts.length) return this._empty('No custom fonts detected');
    return `<div class="card">
      <div class="card-title"><i class="bi bi-type"></i> Detected Fonts <span class="cnt">${f.total}</span></div>
      ${f.fonts.map(font => `
        <div class="font-item">
          <div>
            <div class="font-preview" style="font-family:'${font.name}',sans-serif">${font.name}</div>
            <div class="font-meta">
              Weight: ${font.weights}
              ${font.google ? ` &nbsp;·&nbsp; <a href="${font.link}" target="_blank">Google Font ↗</a>` : ''}
            </div>
          </div>
          <button class="export-btn" onclick="UI.copy('@import url(\\'https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap\\');')">
            <i class="bi bi-clipboard"></i> Copy Import
          </button>
        </div>`).join('')}
    </div>`;
  },

  /* ── Structure ── */
  _structure(s) {
    return `<div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="bi bi-diagram-3-fill"></i> Layout Tree</div>
        ${s.tree.length ? s.tree.map(item => `
          <div class="tree-item">
            <i class="bi bi-${item.icon}"></i>
            <span>${item.label}</span>
            <span class="tree-count">${item.count}</span>
          </div>`).join('') : this._empty('No structure detected')}
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-bar-chart-fill"></i> Element Counts</div>
        ${Object.entries(s.counts).map(([k,v]) => `
          <div class="perf-row">
            <span class="perf-lbl">${k}</span>
            <span class="perf-val">${v}</span>
          </div>`).join('')}
      </div>
    </div>`;
  },

  /* ── Content ── */
  _content(c) {
    return `<div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="bi bi-card-heading"></i> Headings</div>
        ${c.headings.length
          ? c.headings.map(h => `<div class="list-item"><i class="bi bi-chevron-right"></i>${this._esc(h)}</div>`).join('')
          : this._empty('No headings found')}
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-lightbulb-fill"></i> Topics</div>
        ${c.topics.length
          ? c.topics.map(t => `<div class="list-item"><i class="bi bi-dot"></i>${this._esc(t)}</div>`).join('')
          : this._empty('No topics extracted')}
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-tags-fill"></i> Keywords</div>
        <div class="tags">${c.keywords.map(k => `<span class="tag">${this._esc(k)}</span>`).join('') || this._empty('None')}</div>
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-hash"></i> Meta Keywords</div>
        ${c.tags.length
          ? `<div class="tags">${c.tags.map(t => `<span class="tag">#${this._esc(t)}</span>`).join('')}</div>`
          : this._empty('No meta keywords found')}
      </div>
    </div>`;
  },

  /* ── CTAs ── */
  _cta(cta) {
    const block = (label, items, cls) => !items.length ? '' : `
      <div class="card">
        <div class="card-title"><i class="bi bi-cursor-fill"></i> ${label}</div>
        ${items.map(t => `<div class="cta-item"><span class="cta-badge ${cls}">${label.split(' ')[0]}</span>${this._esc(t)}</div>`).join('')}
      </div>`;
    return `
      ${block('Primary CTA', cta.primary, '')}
      ${block('Secondary CTA', cta.secondary, 'sec')}
      <div class="card">
        <div class="card-title"><i class="bi bi-list-ul"></i> All Buttons &amp; Links</div>
        <div class="tags">
          ${cta.all.map(t => `<span class="tag">${this._esc(t)}</span>`).join('') || '<span style="color:var(--muted);font-size:.85rem">None found</span>'}
        </div>
      </div>`;
  },

  /* ── SEO ── */
  _seo(seo) {
    const cls = seo.score >= 70 ? 'good' : seo.score >= 50 ? 'ok' : 'bad';
    const grade = seo.score >= 70 ? 'Good' : seo.score >= 50 ? 'Needs Work' : 'Poor';
    return `
    <div class="grid-2" style="align-items:start">
      <div class="card">
        <div class="card-title"><i class="bi bi-graph-up-arrow"></i> SEO Score</div>
        <div class="score-wrap">
          <div class="score-ring ${cls}">${seo.score}</div>
          <div class="score-label">${grade}</div>
          <div class="score-sub">${seo.imagesTotal} images · ${seo.withAlt} with alt · ${seo.noAlt} missing alt</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-list-check"></i> Meta Tags</div>
        ${this._row('Title',        this._miss(seo.title))}
        ${this._row('Description',  this._miss(seo.metaDesc))}
        ${this._row('Keywords',     this._none(seo.metaKw))}
        ${this._row('Canonical',    this._none(seo.canonical))}
        ${this._row('OG Title',     this._none(seo.ogTitle))}
        ${this._row('OG Image',     seo.ogImage ? `<a href="${seo.ogImage}" target="_blank" style="color:var(--primary2)">View ↗</a>` : this._none(''))}
        ${this._row('Twitter Card', this._none(seo.twCard))}
        ${this._row('Viewport',     this._miss(seo.viewport))}
      </div>
    </div>
    <div class="card" style="margin-top:0">
      <div class="card-title"><i class="bi bi-type-h1"></i> Heading Tags</div>
      ${seo.h1s.length
        ? seo.h1s.map(h => `<div class="cta-item"><span class="cta-badge">H1</span>${this._esc(h)}</div>`).join('')
        : '<div class="a11y-item a11y-warn"><i class="bi bi-exclamation-triangle-fill"></i> No H1 tag found on this page</div>'}
      ${seo.h2s.map(h => `<div class="cta-item"><span class="cta-badge sec">H2</span>${this._esc(h)}</div>`).join('')}
    </div>`;
  },

  /* ── Media ── */
  _media(media) {
    const ph = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='78'><rect fill='%231a2540' width='110' height='78'/><text x='50%25' y='50%25' fill='%238892a4' text-anchor='middle' dy='.3em' font-size='11' font-family='sans-serif'>No Preview</text></svg>`;
    return `
    <div class="card">
      <div class="card-title"><i class="bi bi-images"></i> Images <span class="cnt">${media.totalImages}</span></div>
      ${media.images.length ? `
        <div class="media-grid">
          ${media.images.map(img => `
            <div class="media-item" title="${this._esc(img.alt || img.src)}">
              <img src="${img.src}" alt="${this._esc(img.alt)}" loading="lazy"
                   onerror="this.src='${ph}'">
              <div class="media-name">${this._esc(img.alt || img.src.split('/').pop() || 'image')}</div>
            </div>`).join('')}
        </div>` : this._empty('No images found')}
    </div>
    ${media.videos.length ? `
    <div class="card">
      <div class="card-title"><i class="bi bi-play-circle-fill"></i> Videos <span class="cnt">${media.totalVideos}</span></div>
      ${media.videos.map(v => `<div class="list-item"><i class="bi bi-play-fill"></i><a href="${v.src}" target="_blank">${v.src}</a></div>`).join('')}
    </div>` : ''}`;
  },

  /* ── Contacts ── */
  _contacts(c) {
    const si = { Twitter:'twitter-x', Facebook:'facebook', LinkedIn:'linkedin', Instagram:'instagram', YouTube:'youtube', GitHub:'github', WhatsApp:'whatsapp' };
    return `<div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="bi bi-envelope-fill"></i> Emails</div>
        ${c.emails.length
          ? c.emails.map(e => `<div class="list-item"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}">${e}</a></div>`).join('')
          : this._empty('No emails found')}
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-telephone-fill"></i> Phone Numbers</div>
        ${c.phones.length
          ? c.phones.map(p => `<div class="list-item"><i class="bi bi-telephone-fill"></i><a href="tel:${p}">${p}</a></div>`).join('')
          : this._empty('No phone numbers found')}
      </div>
      <div class="card" style="grid-column:1/-1">
        <div class="card-title"><i class="bi bi-share-fill"></i> Social Media</div>
        ${Object.entries(c.social).length
          ? Object.entries(c.social).map(([k,url]) => `
              <div class="list-item">
                <i class="bi bi-${si[k]||'link-45deg'}"></i>
                <a href="${url}" target="_blank">${url}</a>
              </div>`).join('')
          : this._empty('No social links found')}
      </div>
    </div>`;
  },

  /* ── Tech ── */
  _tech(tech) {
    return `
    <div class="card">
      <div class="card-title"><i class="bi bi-cpu-fill"></i> Detected Technologies <span class="cnt">${tech.detected.length}</span></div>
      <div class="tech-wrap" style="margin-top:.25rem">
        ${tech.detected.length
          ? tech.detected.map(t => `<span class="tech-badge"><span class="dot"></span>${t}</span>`).join('')
          : this._empty('No technologies detected')}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><i class="bi bi-file-code-fill"></i> Script Sources <span class="cnt">${tech.scriptsCount}</span></div>
      ${tech.scriptSrcs.length
        ? tech.scriptSrcs.map(s => `
            <div class="list-item" style="font-size:.78rem">
              <i class="bi bi-code-slash"></i>
              <span style="word-break:break-all">${s}</span>
            </div>`).join('')
        : this._empty('No external scripts found')}
    </div>`;
  },

  /* ── Performance ── */
  _performance(p) {
    return `<div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="bi bi-speedometer2"></i> Page Metrics</div>
        <div class="perf-row"><span class="perf-lbl">HTML Size</span><span class="perf-val">${p.htmlSizeKB} KB</span></div>
        <div class="perf-row"><span class="perf-lbl">Scripts</span><span class="perf-val">${p.scriptsCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Stylesheets</span><span class="perf-val">${p.stylesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Images</span><span class="perf-val">${p.imagesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Iframes</span><span class="perf-val">${p.iframesCount}</span></div>
        <div class="perf-row"><span class="perf-lbl">Inline Script Size</span><span class="perf-val">${p.inlineKB} KB</span></div>
      </div>
      <div class="card">
        <div class="card-title"><i class="bi bi-universal-access"></i> Accessibility</div>
        ${p.a11y.map(w => `
          <div class="a11y-item ${w.ok ? 'a11y-ok' : 'a11y-warn'}">
            <i class="bi bi-${w.ok ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i>
            ${w.msg}
          </div>`).join('')}
      </div>
    </div>`;
  },

  /* ── Clipboard helpers ── */
  copy(val) {
    navigator.clipboard.writeText(val).then(() => this.toast('Copied: ' + val));
  },
  copyCSSVars(colors) {
    const css = `:root {\n${colors.map((c,i) => `  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(() => this.toast('CSS variables copied!'));
  }
};
