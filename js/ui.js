const UI = {
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  },

  e(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },

  renderBanner(data) {
    const o = data.overview;
    document.getElementById('siteBanner').innerHTML = `
      <div class="sb-title">${this.e(o.title)}</div>
      <div class="sb-desc">${this.e(o.desc) || '<em style="opacity:.45">No description found</em>'}</div>
      <div class="sb-tags">
        <span class="sb-tag"><i class="bi bi-tag-fill"></i>${this.e(o.type)}</span>
        <span class="sb-tag"><i class="bi bi-translate"></i>${this.e(o.lang)}</span>
        <span class="sb-tag"><i class="bi bi-layout-split"></i>${o.sections} sections</span>
        <span class="sb-tag"><i class="bi bi-lightbulb-fill"></i>${this.e(o.topic)}</span>
      </div>`;
  },

  renderStats(data) {
    const { colors, fonts, media, contacts, tech, seo, structure } = data;
    const cards = [
      { icon:'🎨', val:colors.total,              lbl:'Colors'    },
      { icon:'🔤', val:fonts.total,               lbl:'Fonts'     },
      { icon:'🖼️', val:media.totalImages,         lbl:'Images'    },
      { icon:'📧', val:contacts.emails.length,    lbl:'Emails'    },
      { icon:'⚙️', val:tech.scriptsCount,         lbl:'Scripts'   },
      { icon:'📊', val:seo.score+'/100',          lbl:'SEO Score' },
      { icon:'🔗', val:structure.counts.Links||0, lbl:'Links'     },
      { icon:'🛠️', val:tech.detected.length,      lbl:'Tech Found'},
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
      colors:      () => this.tColors(data.colors),
      fonts:       () => this.tFonts(data.fonts),
      structure:   () => this.tStructure(data.structure),
      content:     () => this.tContent(data.content),
      cta:         () => this.tCTA(data.cta),
      seo:         () => this.tSEO(data.seo),
      media:       () => this.tMedia(data.media),
      contacts:    () => this.tContacts(data.contacts),
      tech:        () => this.tTech(data.tech),
      performance: () => this.tPerf(data.performance),
    };
    document.getElementById('tabContent').innerHTML =
      `<div class="fu">${(map[tab]||map.overview)()}</div>`;
  },

  /* helpers */
  irow(lbl, val) { return `<div class="irow"><span class="ilbl">${lbl}</span><span class="ival">${val}</span></div>`; },
  crow(lbl, pass) {
    return `<div class="crow"><span class="clbl">${lbl}</span>
      <span class="${pass?'pass':'fail'}"><i class="bi bi-${pass?'check-circle-fill':'x-circle-fill'}"></i>${pass?'Pass':'Fail'}</span>
    </div>`;
  },
  empty(msg) { return `<div class="empty"><i class="bi bi-inbox"></i><p>${msg}</p></div>`; },
  miss(v) { return v ? this.e(v) : '<em style="color:var(--red);font-style:normal">Missing</em>'; },
  none(v) { return v ? this.e(v) : '<em style="color:var(--muted);font-style:normal">None</em>'; },

  /* ── Overview ── */
  tOverview(d) {
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-info-circle-fill"></i> Site Summary</div>
        ${this.irow('URL', `<a href="${this.e(d.url)}" target="_blank" style="color:var(--primary2);word-break:break-all">${this.e(d.url)}</a>`)}
        ${this.irow('Title',    this.e(d.seo.title)||'—')}
        ${this.irow('Type',     d.overview.type)}
        ${this.irow('Language', d.overview.lang)}
        ${this.irow('Sections', d.overview.sections)}
        ${this.irow('Elements', d.structure.totalElements.toLocaleString())}
        ${this.irow('HTML Size',d.performance.htmlSizeKB+' KB')}
        ${this.irow('Scanned',  new Date(d.scannedAt).toLocaleString())}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-shield-check"></i> Quick Checks</div>
        ${this.crow('Meta Title',       !!d.seo.title)}
        ${this.crow('Meta Description', !!d.seo.metaDesc)}
        ${this.crow('H1 Tag',           d.seo.h1s.length===1)}
        ${this.crow('OG / Social Tags', !!d.seo.ogTitle)}
        ${this.crow('Viewport Meta',    !!d.seo.viewport)}
        ${this.crow('Images with Alt',  d.seo.noAlt===0)}
        ${this.crow('Tech Detected',    d.tech.detected.length>0)}
        ${this.crow('Contact Info',     d.contacts.emails.length>0||Object.keys(d.contacts.social).length>0)}
      </div>
    </div>`;
  },

  /* ── Colors ── */
  tColors(c) {
    if (!c.colors.length) return this.empty('No colors detected on this page');
    return `
    <div class="card">
      <div class="card-head"><i class="bi bi-palette-fill"></i> Color Palette <span class="badge-cnt">${c.total}</span></div>
      <div class="color-grid">
        ${c.colors.map(hex=>`
          <div class="color-item" onclick="UI.copy('${hex}')" title="Click to copy">
            <div class="swatch" style="background:${hex}"></div>
            <span class="chex">${hex}</span>
            <span class="crgb">${ColorAnalyzer.toRgb(hex)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-code-slash"></i> CSS Variables</div>
      <pre>:root {\n${c.colors.map((h,i)=>`  --color-${i+1}: ${h};`).join('\n')}\n}</pre>
      <button class="exp-btn" style="margin-top:.875rem" onclick="UI.copyCSSVars(${JSON.stringify(c.colors)})">
        <i class="bi bi-clipboard"></i> Copy CSS Variables
      </button>
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
          <button class="exp-btn" onclick="UI.copy('@import url(\\'https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap\\');')">
            <i class="bi bi-clipboard"></i> Copy
          </button>
        </div>`).join('')}
    </div>`;
  },

  /* ── Structure ── */
  tStructure(s) {
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-diagram-3-fill"></i> Layout Tree</div>
        ${s.tree.length ? s.tree.map(t=>`
          <div class="tree-row">
            <i class="bi bi-${t.icon}"></i><span>${t.label}</span>
            <span class="tree-cnt">${t.count}</span>
          </div>`).join('') : this.empty('No structure detected')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-bar-chart-fill"></i> Element Counts</div>
        ${Object.entries(s.counts).map(([k,v])=>`
          <div class="prow"><span class="plbl">${k}</span><span class="pval">${v}</span></div>`).join('')}
      </div>
    </div>`;
  },

  /* ── Content ── */
  tContent(c) {
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-card-heading"></i> Headings</div>
        ${c.headings.length ? c.headings.map(h=>`<div class="litem"><i class="bi bi-chevron-right"></i>${this.e(h)}</div>`).join('') : this.empty('No headings found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-lightbulb-fill"></i> Topics</div>
        ${c.topics.length ? c.topics.map(t=>`<div class="litem"><i class="bi bi-dot"></i>${this.e(t)}</div>`).join('') : this.empty('No topics extracted')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-tags-fill"></i> Keywords</div>
        <div class="tags">${c.keywords.map(k=>`<span class="tag">${this.e(k)}</span>`).join('')||this.empty('None')}</div>
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-hash"></i> Meta Keywords</div>
        ${c.tags.length ? `<div class="tags">${c.tags.map(t=>`<span class="tag">#${this.e(t)}</span>`).join('')}</div>` : this.empty('No meta keywords')}
      </div>
    </div>`;
  },

  /* ── CTAs ── */
  tCTA(cta) {
    const blk = (lbl, items, cls) => !items.length ? '' : `
      <div class="card">
        <div class="card-head"><i class="bi bi-cursor-fill"></i> ${lbl}</div>
        ${items.map(t=>`<div class="cta-row"><span class="cta-badge ${cls}">${lbl.split(' ')[0]}</span>${this.e(t)}</div>`).join('')}
      </div>`;
    return `
      ${blk('Primary CTA', cta.primary, '')}
      ${blk('Secondary CTA', cta.secondary, 'sec')}
      <div class="card">
        <div class="card-head"><i class="bi bi-list-ul"></i> All Buttons &amp; Links</div>
        <div class="tags">${cta.all.map(t=>`<span class="tag">${this.e(t)}</span>`).join('')||'<span style="color:var(--muted);font-size:.85rem">None found</span>'}</div>
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
        <div class="card-head"><i class="bi bi-list-check"></i> Meta Tags</div>
        ${this.irow('Title',       this.miss(seo.title))}
        ${this.irow('Description', this.miss(seo.metaDesc))}
        ${this.irow('Keywords',    this.none(seo.metaKw))}
        ${this.irow('Canonical',   this.none(seo.canonical))}
        ${this.irow('OG Title',    this.none(seo.ogTitle))}
        ${this.irow('OG Image',    seo.ogImage?`<a href="${this.e(seo.ogImage)}" target="_blank" style="color:var(--primary2)">View ↗</a>`:this.none(''))}
        ${this.irow('Twitter Card',this.none(seo.twCard))}
        ${this.irow('Viewport',    this.miss(seo.viewport))}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-type-h1"></i> Heading Tags</div>
      ${seo.h1s.length
        ? seo.h1s.map(h=>`<div class="cta-row"><span class="cta-badge">H1</span>${this.e(h)}</div>`).join('')
        : '<div class="a11y-row a11y-warn"><i class="bi bi-exclamation-triangle-fill"></i> No H1 tag found</div>'}
      ${seo.h2s.map(h=>`<div class="cta-row"><span class="cta-badge sec">H2</span>${this.e(h)}</div>`).join('')}
    </div>`;
  },

  /* ── Media ── */
  tMedia(media) {
    const ph = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='108' height='76'><rect fill='%23162035' width='108' height='76'/><text x='50%25' y='50%25' fill='%237a8fa8' text-anchor='middle' dy='.3em' font-size='11' font-family='sans-serif'>No Preview</text></svg>`;
    return `
    <div class="card">
      <div class="card-head"><i class="bi bi-images"></i> Images <span class="badge-cnt">${media.totalImages}</span></div>
      ${media.images.length ? `
        <div class="media-grid">
          ${media.images.map(img=>`
            <div class="media-card" title="${this.e(img.alt||img.src)}">
              <img src="${this.e(img.src)}" alt="${this.e(img.alt)}" loading="lazy" onerror="this.src='${ph}'">
              <div class="media-lbl">${this.e(img.alt||img.src.split('/').pop()||'image')}</div>
            </div>`).join('')}
        </div>` : this.empty('No images found')}
    </div>
    ${media.videos.length ? `
    <div class="card">
      <div class="card-head"><i class="bi bi-play-circle-fill"></i> Videos <span class="badge-cnt">${media.totalVideos}</span></div>
      ${media.videos.map(v=>`<div class="litem"><i class="bi bi-play-fill"></i><a href="${this.e(v.src)}" target="_blank">${this.e(v.src)}</a></div>`).join('')}
    </div>` : ''}`;
  },

  /* ── Contacts ── */
  tContacts(c) {
    const si = {Twitter:'twitter-x',Facebook:'facebook',LinkedIn:'linkedin',Instagram:'instagram',YouTube:'youtube',GitHub:'github',WhatsApp:'whatsapp'};
    return `<div class="g2">
      <div class="card">
        <div class="card-head"><i class="bi bi-envelope-fill"></i> Emails</div>
        ${c.emails.length ? c.emails.map(e=>`<div class="litem"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}">${e}</a></div>`).join('') : this.empty('No emails found')}
      </div>
      <div class="card">
        <div class="card-head"><i class="bi bi-telephone-fill"></i> Phone Numbers</div>
        ${c.phones.length ? c.phones.map(p=>`<div class="litem"><i class="bi bi-telephone-fill"></i><a href="tel:${p}">${p}</a></div>`).join('') : this.empty('No phone numbers found')}
      </div>
      <div class="card" style="grid-column:1/-1">
        <div class="card-head"><i class="bi bi-share-fill"></i> Social Media</div>
        ${Object.entries(c.social).length
          ? Object.entries(c.social).map(([k,url])=>`<div class="litem"><i class="bi bi-${si[k]||'link-45deg'}"></i><a href="${this.e(url)}" target="_blank">${this.e(url)}</a></div>`).join('')
          : this.empty('No social links found')}
      </div>
    </div>`;
  },

  /* ── Tech ── */
  tTech(tech) {
    return `
    <div class="card">
      <div class="card-head"><i class="bi bi-cpu-fill"></i> Detected Technologies <span class="badge-cnt">${tech.detected.length}</span></div>
      <div class="tech-wrap">
        ${tech.detected.length
          ? tech.detected.map(t=>`<span class="tech-chip"><span class="tdot"></span>${this.e(t)}</span>`).join('')
          : this.empty('No technologies detected')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><i class="bi bi-file-code-fill"></i> Script Sources <span class="badge-cnt">${tech.scriptsCount}</span></div>
      ${tech.scriptSrcs.length
        ? tech.scriptSrcs.map(s=>`<div class="litem" style="font-size:.78rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all">${this.e(s)}</span></div>`).join('')
        : this.empty('No external scripts')}
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
        ${p.a11y.map(w=>`
          <div class="a11y-row ${w.ok?'a11y-ok':'a11y-warn'}">
            <i class="bi bi-${w.ok?'check-circle-fill':'exclamation-triangle-fill'}"></i>${w.msg}
          </div>`).join('')}
      </div>
    </div>`;
  },

  copy(val) { navigator.clipboard.writeText(val).then(()=>this.toast('Copied: '+val)); },
  copyCSSVars(colors) {
    const css = `:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(()=>this.toast('CSS variables copied!'));
  }
};
