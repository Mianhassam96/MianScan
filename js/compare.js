const Compare = {
  dataA: null,
  dataB: null,

  async runInline(urlA, urlB, bar, lbl, outputEl) {
    const update = (msg, pct) => { bar.style.width = pct+'%'; lbl.textContent = msg; };
    const saved = Scanner.currentData;
    update('Scanning Site A…', 5);
    this.dataA = await Scanner.scan(urlA, (m,p) => update('Site A — '+m, p*0.46));
    update('Scanning Site B…', 50);
    this.dataB = await Scanner.scan(urlB, (m,p) => update('Site B — '+m, 50+p*0.46));
    update('Building report…', 100);
    Scanner.currentData = saved;
    outputEl.innerHTML = this._buildOutput(this.dataA, this.dataB);
  },

  async run(urlA, urlB) {
    const bar   = document.getElementById('compareBar');
    const label = document.getElementById('compareLabel');
    const prog  = document.getElementById('compareProgress');
    prog.classList.remove('hidden');
    bar.style.width = '0%';

    const update = (msg, pct) => { bar.style.width = pct + '%'; label.textContent = msg; };

    // Save existing scan so we don't overwrite it
    const savedData = Scanner.currentData;

    update('Scanning Site A…', 5);
    this.dataA = await Scanner.scan(urlA, (m, p) => update('Site A — ' + m, p * 0.46));

    update('Scanning Site B…', 50);
    this.dataB = await Scanner.scan(urlB, (m, p) => update('Site B — ' + m, 50 + p * 0.46));

    update('Building report…', 100);
    setTimeout(() => prog.classList.add('hidden'), 800);

    // Restore previous single scan data
    Scanner.currentData = savedData;

    this.render(this.dataA, this.dataB);
  },

  render(a, b) {
    const out = document.getElementById('compareOutput');
    out.innerHTML = this._buildOutput(a, b);
  },

  _buildOutput(a, b) {
    const hostA = new URL(a.url).hostname;
    const hostB = new URL(b.url).hostname;

    // Determine overall winner
    const scoreA = a.seo.score + (a.mobile?.score||0) + (a.security?.score||0);
    const scoreB = b.seo.score + (b.mobile?.score||0) + (b.security?.score||0);
    const winnerHost = scoreA > scoreB ? hostA : scoreB > scoreA ? hostB : null;
    const winnerBadge = winnerHost
      ? `<div style="text-align:center;margin-bottom:1.5rem">
          <div style="display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,var(--primary),var(--purple));color:#fff;border-radius:30px;padding:.5rem 1.5rem;font-weight:800;font-size:.95rem;box-shadow:0 4px 20px rgba(100,112,255,.4)">
            <i class="bi bi-trophy-fill"></i> ${winnerHost} wins overall
          </div>
        </div>` : `<div style="text-align:center;margin-bottom:1.5rem"><span style="color:var(--muted);font-size:.9rem">🤝 It's a tie!</span></div>`;

    return `
      <div class="compare-title-row">
        <div class="compare-site-label"><i class="bi bi-globe2"></i><a href="${a.url}" target="_blank">${hostA}</a></div>
        <div class="compare-vs-badge">VS</div>
        <div class="compare-site-label"><i class="bi bi-globe2"></i><a href="${b.url}" target="_blank">${hostB}</a></div>
      </div>
      ${winnerBadge}
      <div class="cmp-col-headers">
        <div class="cmp-col-hdr">${hostA}</div>
        <div class="cmp-col-hdr">${hostB}</div>
      </div>
      ${this.section('📊 SEO Score',      this.seoBlock(a,b))}
      ${this.section('🏆 DA / Authority', this.daBlock(a,b))}
      ${this.section('🌍 Ranking',        this.rankBlock(a,b))}
      ${this.section('🔑 Top Keywords',   this.keywordsBlock(a,b))}
      ${this.section('📝 Headings',       this.headingsBlock(a,b))}
      ${this.section('🎯 Primary CTAs',   this.ctaBlock(a,b))}
      ${this.section('🛠️ Tech Stack',     this.techBlock(a,b))}
      ${this.section('🎨 Colors',         this.colorsBlock(a,b))}
      ${this.section('🔤 Fonts',          this.fontsBlock(a,b))}
      ${this.section('⚡ Performance',    this.perfBlock(a,b))}
      ${this.section('📱 Mobile Score',   this.mobileBlock(a,b))}
      ${this.section('🔐 Security Score', this.securityBlock(a,b))}
      ${this.section('📧 Contacts',       this.contactsBlock(a,b))}
    `;
  },

  section(title, content) {
    return `<div class="cmp-section">
      <div class="cmp-section-title">${title}</div>
      <div class="cmp-row">${content}</div>
    </div>`;
  },

  col(content) { return `<div class="cmp-col">${content}</div>`; },

  daBlock(a, b) {
    const da = d => {
      const val = d.domain?.da !== null && d.domain?.da !== undefined ? d.domain.da : Math.round(d.seo.score/15);
      const pa  = Math.min(100, Math.round(d.seo.score*0.85));
      return `<div class="cmp-score-wrap">
        <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:.5rem">
          <div><div style="font-size:1.8rem;font-weight:900;color:var(--primary2)">${val}</div><div style="font-size:.72rem;color:var(--muted)">DA</div></div>
          <div><div style="font-size:1.8rem;font-weight:900;color:var(--accent)">${pa}</div><div style="font-size:.72rem;color:var(--muted)">PA</div></div>
        </div>
        <div style="font-size:.78rem;color:var(--muted)">SEO Score: ${d.seo.score}/100</div>
      </div>`;
    };
    return this.col(da(a)) + this.col(da(b));
  },

  rankBlock(a, b) {
    const rank = d => {
      const gr = d.ranking?.globalRank ? '#'+Number(d.ranking.globalRank).toLocaleString() : 'N/A';
      const tr = d.ranking?.trafficEst || 'N/A';
      return `<div class="cmp-score-wrap">
        <div style="font-size:1.5rem;font-weight:900;color:var(--primary2)">${gr}</div>
        <div style="font-size:.78rem;color:var(--muted);margin-top:.3rem">Global Rank</div>
        <div style="font-size:1rem;font-weight:700;color:var(--accent);margin-top:.5rem">${tr}</div>
        <div style="font-size:.72rem;color:var(--muted)">Monthly Traffic</div>
      </div>`;
    };
    return this.col(rank(a)) + this.col(rank(b));
  },

  headingsBlock(a, b) {
    const h = d => `
      <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:.75rem">
        <div class="auth-card" style="flex:1"><div class="auth-val" style="color:${d.seo.h1s.length===1?'var(--green)':d.seo.h1s.length===0?'var(--red)':'var(--yellow)'}">${d.seo.h1s.length}</div><div class="auth-lbl">H1</div></div>
        <div class="auth-card" style="flex:1"><div class="auth-val" style="color:var(--primary2)">${(d.seo.h2s||[]).length}</div><div class="auth-lbl">H2</div></div>
        <div class="auth-card" style="flex:1"><div class="auth-val" style="color:var(--accent)">${(d.seo.h3s||[]).length}</div><div class="auth-lbl">H3</div></div>
      </div>
      ${d.seo.h1s.length ? d.seo.h1s.slice(0,2).map(h=>`<div class="litem" style="font-size:.8rem"><i class="bi bi-type-h1" style="color:var(--primary2)"></i>${h}</div>`).join('') : '<div class="a11y-row a11y-warn" style="font-size:.8rem"><i class="bi bi-exclamation-triangle-fill"></i>No H1</div>'}`;
    return this.col(h(a)) + this.col(h(b));
  },

  seoBlock(a, b) {
    const winner = a.seo.score > b.seo.score ? 'a' : b.seo.score > a.seo.score ? 'b' : null;
    const ring = (d, side) => {
      const cls = d.seo.score>=70?'sg':d.seo.score>=50?'so':'sb';
      const isWinner = winner === side;
      return `<div class="cmp-score-wrap">
        ${isWinner ? `<div style="font-size:.72rem;font-weight:700;color:var(--green);margin-bottom:.4rem"><i class="bi bi-trophy-fill"></i> WINNER</div>` : ''}
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
    return this.col(ring(a,'a')) + this.col(ring(b,'b'));
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
    const winner = parseFloat(a.performance.htmlSizeKB) < parseFloat(b.performance.htmlSizeKB) ? 'a' : 'b';
    const perf = (d, side) => {
      const score = d.performance.score ?? null;
      const grade = d.performance.grade ?? null;
      const gradeColor = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--primary2)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';
      return `
        ${score !== null ? `<div style="text-align:center;margin-bottom:.75rem">
          ${winner===side?`<div style="font-size:.72rem;font-weight:700;color:var(--green);margin-bottom:.3rem"><i class="bi bi-trophy-fill"></i> FASTER</div>`:''}
          <div class="score-ring" style="width:64px;height:64px;font-size:1.1rem;border-color:${gradeColor};color:${gradeColor};margin:0 auto .4rem">${score}</div>
          <div style="font-size:.78rem;color:var(--muted)">Grade ${grade}</div>
        </div>` : ''}
        <div class="prow"><span class="plbl">HTML Size</span><span class="pval">${d.performance.htmlSizeKB} KB</span></div>
        <div class="prow"><span class="plbl">Scripts</span><span class="pval">${d.performance.scriptsCount}</span></div>
        <div class="prow"><span class="plbl">Images</span><span class="pval">${d.performance.imagesCount}</span></div>
        <div class="prow"><span class="plbl">Stylesheets</span><span class="pval">${d.performance.stylesCount}</span></div>
        <div class="prow"><span class="plbl">Lazy Images</span><span class="pval">${d.performance.lazyImgs ?? '—'}</span></div>`;
    };
    return this.col(`<div class="card" style="margin:0">${perf(a,'a')}</div>`) + this.col(`<div class="card" style="margin:0">${perf(b,'b')}</div>`);
  },

  contactsBlock(a, b) {
    const info = d => {
      const emails = d.contacts.emails.slice(0,3).map(e=>`<div class="litem" style="font-size:.82rem"><i class="bi bi-envelope-fill"></i>${e}</div>`).join('');
      const socials = Object.keys(d.contacts.social).slice(0,4).map(k=>`<span class="tag">${k}</span>`).join('');
      return (emails||'<span style="color:var(--muted);font-size:.82rem">No emails</span>') +
             (socials ? `<div class="tags" style="margin-top:.5rem">${socials}</div>` : '');
    };
    return this.col(info(a)) + this.col(info(b));
  },

  mobileBlock(a, b) {
    const mob = d => {
      const s = d.mobile?.score ?? '—';
      const g = d.mobile?.grade ?? '?';
      const c = s >= 80 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
      return `<div class="cmp-score-wrap">
        <div class="score-ring" style="width:72px;height:72px;font-size:1.3rem;border-color:${c};color:${c}">${s}</div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:.5rem">Grade ${g}</div>
        ${(d.mobile?.checks||[]).slice(0,4).map(c=>`<div class="${c.type==='ok'?'pass':'fail'}" style="font-size:.78rem;margin-top:.3rem"><i class="bi bi-${c.type==='ok'?'check-circle-fill':'x-circle-fill'}"></i> ${c.label}</div>`).join('')}
      </div>`;
    };
    return this.col(mob(a)) + this.col(mob(b));
  },

  securityBlock(a, b) {
    const sec = d => {
      const s = d.security?.score ?? '—';
      const g = d.security?.grade ?? '?';
      const c = s >= 80 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
      return `<div class="cmp-score-wrap">
        <div class="score-ring" style="width:72px;height:72px;font-size:1.3rem;border-color:${c};color:${c}">${s}</div>
        <div style="font-size:.82rem;color:var(--muted);margin-top:.5rem">Grade ${g}</div>
        <div style="margin-top:.5rem;font-size:.82rem;font-weight:700;color:${d.security?.https?'var(--green)':'var(--red)'}">
          <i class="bi bi-${d.security?.https?'lock-fill':'unlock-fill'}"></i> ${d.security?.https?'HTTPS':'HTTP'}
        </div>
      </div>`;
    };
    return this.col(sec(a)) + this.col(sec(b));
  }
};
