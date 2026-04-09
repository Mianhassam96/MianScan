const Compare = {
  dataA: null,
  dataB: null,

  async run(urlA, urlB) {
    const bar   = document.getElementById('compareBar');
    const label = document.getElementById('compareLabel');
    const prog  = document.getElementById('compareProgress');
    prog.classList.remove('hidden');
    bar.style.width = '0%';

    const update = (msg, pct) => { bar.style.width = pct+'%'; label.textContent = msg; };

    update('Scanning Site A…', 10);
    this.dataA = await Scanner.scan(urlA, (m,p) => update('Site A: '+m, p*0.48));

    update('Scanning Site B…', 50);
    this.dataB = await Scanner.scan(urlB, (m,p) => update('Site B: '+m, 50+p*0.48));

    update('Building comparison…', 100);
    setTimeout(() => prog.classList.add('hidden'), 800);

    this.render(this.dataA, this.dataB);
  },

  render(a, b) {
    const out = document.getElementById('compareOutput');
    out.innerHTML = `
      <div class="compare-title-row">
        <div class="compare-site-label">
          <i class="bi bi-globe2"></i>
          <a href="${a.url}" target="_blank">${new URL(a.url).hostname}</a>
        </div>
        <div class="compare-vs-badge">VS</div>
        <div class="compare-site-label">
          <i class="bi bi-globe2"></i>
          <a href="${b.url}" target="_blank">${new URL(b.url).hostname}</a>
        </div>
      </div>

      ${this.section('📊 SEO Score', this.seoBlock(a,b))}
      ${this.section('🔑 Top Keywords', this.keywordsBlock(a,b))}
      ${this.section('🎯 Primary CTAs', this.ctaBlock(a,b))}
      ${this.section('🛠️ Tech Stack', this.techBlock(a,b))}
      ${this.section('🎨 Colors', this.colorsBlock(a,b))}
      ${this.section('🔤 Fonts', this.fontsBlock(a,b))}
      ${this.section('⚡ Performance', this.perfBlock(a,b))}
      ${this.section('📧 Contacts', this.contactsBlock(a,b))}
    `;
  },

  section(title, content) {
    return `<div class="cmp-section">
      <div class="cmp-section-title">${title}</div>
      <div class="cmp-row">${content}</div>
    </div>`;
  },

  col(content) { return `<div class="cmp-col">${content}</div>`; },

  seoBlock(a, b) {
    const ring = (d) => {
      const cls = d.seo.score>=70?'sg':d.seo.score>=50?'so':'sb';
      return `<div class="cmp-score-wrap">
        <div class="score-ring ${cls}" style="width:80px;height:80px;font-size:1.4rem">${d.seo.score}</div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:.5rem">
          H1: ${d.seo.h1s.length} · H2: ${d.seo.h2s.length}<br>
          ${d.seo.noAlt} missing alt · ${d.seo.imagesTotal} images
        </div>
        <div style="margin-top:.75rem;font-size:.82rem">
          <div class="${d.seo.title?'pass':'fail'}" style="margin-bottom:.25rem"><i class="bi bi-${d.seo.title?'check-circle-fill':'x-circle-fill'}"></i> Meta Title</div>
          <div class="${d.seo.metaDesc?'pass':'fail'}" style="margin-bottom:.25rem"><i class="bi bi-${d.seo.metaDesc?'check-circle-fill':'x-circle-fill'}"></i> Meta Description</div>
          <div class="${d.seo.ogTitle?'pass':'fail'}"><i class="bi bi-${d.seo.ogTitle?'check-circle-fill':'x-circle-fill'}"></i> OG Tags</div>
        </div>
      </div>`;
    };
    return this.col(ring(a)) + this.col(ring(b));
  },

  keywordsBlock(a, b) {
    const kws = d => d.content.keywords.slice(0,8).map(k=>
      `<span class="tag" style="margin:.2rem">${k.word} <em style="opacity:.6;font-style:normal">${k.density}%</em></span>`
    ).join('');
    return this.col(`<div class="tags">${kws(a)}</div>`) + this.col(`<div class="tags">${kws(b)}</div>`);
  },

  ctaBlock(a, b) {
    const ctas = d => d.cta.primary.concat(d.cta.secondary).slice(0,5).map(t=>
      `<div class="cta-row"><span class="cta-badge">CTA</span>${t}</div>`
    ).join('') || '<span style="color:var(--muted);font-size:.85rem">None detected</span>';
    return this.col(ctas(a)) + this.col(ctas(b));
  },

  techBlock(a, b) {
    const chips = d => d.tech.detected.length
      ? `<div class="tech-wrap">${d.tech.detected.map(t=>`<span class="tech-chip"><span class="tdot"></span>${t}</span>`).join('')}</div>`
      : '<span style="color:var(--muted);font-size:.85rem">None detected</span>';
    return this.col(chips(a)) + this.col(chips(b));
  },

  colorsBlock(a, b) {
    const swatches = d => `<div class="color-grid" style="gap:.5rem">
      ${d.colors.colors.slice(0,12).map(hex=>`
        <div class="color-item" onclick="UI.copy('${hex}')" title="${hex}" style="gap:.2rem">
          <div class="swatch" style="background:${hex};width:40px;height:40px;border-radius:8px"></div>
          <span class="chex">${hex}</span>
        </div>`).join('')}
    </div>`;
    return this.col(swatches(a)) + this.col(swatches(b));
  },

  fontsBlock(a, b) {
    const fonts = d => d.fonts.fonts.length
      ? d.fonts.fonts.map(f=>`<div class="litem"><i class="bi bi-type"></i><span style="font-family:'${f.name}',sans-serif;font-weight:700">${f.name}</span><span style="color:var(--muted);font-size:.75rem;margin-left:.5rem">${f.weights}</span></div>`).join('')
      : '<span style="color:var(--muted);font-size:.85rem">None detected</span>';
    return this.col(fonts(a)) + this.col(fonts(b));
  },

  perfBlock(a, b) {
    const perf = d => `
      <div class="prow"><span class="plbl">HTML Size</span><span class="pval">${d.performance.htmlSizeKB} KB</span></div>
      <div class="prow"><span class="plbl">Scripts</span><span class="pval">${d.performance.scriptsCount}</span></div>
      <div class="prow"><span class="plbl">Images</span><span class="pval">${d.performance.imagesCount}</span></div>
      <div class="prow"><span class="plbl">Stylesheets</span><span class="pval">${d.performance.stylesCount}</span></div>`;
    return this.col(`<div class="card" style="margin:0">${perf(a)}</div>`) + this.col(`<div class="card" style="margin:0">${perf(b)}</div>`);
  },

  contactsBlock(a, b) {
    const info = d => {
      const emails = d.contacts.emails.slice(0,3).map(e=>`<div class="litem" style="font-size:.82rem"><i class="bi bi-envelope-fill"></i>${e}</div>`).join('');
      const socials = Object.keys(d.contacts.social).slice(0,4).map(k=>`<span class="tag">${k}</span>`).join('');
      return (emails||'<span style="color:var(--muted);font-size:.82rem">No emails</span>') +
             (socials ? `<div class="tags" style="margin-top:.5rem">${socials}</div>` : '');
    };
    return this.col(info(a)) + this.col(info(b));
  }
};
