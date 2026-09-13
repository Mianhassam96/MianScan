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
    const savedData = Scanner.currentData;
    update('Scanning Site A…', 5);
    this.dataA = await Scanner.scan(urlA, (m, p) => update('Site A — ' + m, p * 0.46));
    update('Scanning Site B…', 50);
    this.dataB = await Scanner.scan(urlB, (m, p) => update('Site B — ' + m, 50 + p * 0.46));
    update('Building report…', 100);
    setTimeout(() => prog.classList.add('hidden'), 800);
    Scanner.currentData = savedData;
    this.render(this.dataA, this.dataB);
  },

  render(a, b) {
    document.getElementById('compareOutput').innerHTML = this._buildOutput(a, b);
  },

  // ── Helpers ────────────────────────────────────────────────────────────

  _e(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },

  _scoreColor(s) {
    return s >= 80 ? 'var(--green)' : s >= 65 ? 'var(--primary2)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
  },

  _grade(s) { return s>=90?'A':s>=80?'B':s>=65?'C':s>=50?'D':'F'; },

  // Returns 'a', 'b', or null
  _winner(va, vb) {
    if (va == null || vb == null) return null;
    return va > vb ? 'a' : vb > va ? 'b' : null;
  },

  // Build the full compare output
  _buildOutput(a, b) {
    const hostA = new URL(a.url).hostname.replace(/^www\./, '');
    const hostB = new URL(b.url).hostname.replace(/^www\./, '');
    const gA    = a.growth?.overall ?? a.seo.score;
    const gB    = b.growth?.overall ?? b.seo.score;
    const winnerSide = this._winner(gA, gB);
    const winnerHost = winnerSide === 'a' ? hostA : winnerSide === 'b' ? hostB : null;

    return `
      ${this._headerBlock(a, b, hostA, hostB, gA, gB, winnerHost)}
      ${this._advantageBlock(a, b, hostA, hostB)}
      ${this._categoryBars(a, b, hostA, hostB)}
      ${this._detailSections(a, b, hostA, hostB)}
    `;
  },

  // ── 1. HERO HEADER ────────────────────────────────────────────────────

  _headerBlock(a, b, hostA, hostB, gA, gB, winnerHost) {
    const cA = this._scoreColor(gA);
    const cB = this._scoreColor(gB);
    const diff = Math.abs(gA - gB);
    const winnerBadge = winnerHost
      ? `<div class="cmp6-winner-banner">
           <i class="bi bi-trophy-fill"></i>
           <span>${winnerHost} leads overall</span>
           <span class="cmp6-winner-diff">+${diff} points</span>
         </div>`
      : `<div class="cmp6-winner-banner cmp6-tie">
           <i class="bi bi-dash-circle-fill"></i>
           <span>It's a tie</span>
         </div>`;

    const ringA = this._growthRing(gA, cA, a.growth?.label ?? (gA>=80?'Strong':gA>=65?'Good':'Needs Work'), this._grade(gA), winnerHost ? (winnerHost === hostA) : false);
    const ringB = this._growthRing(gB, cB, b.growth?.label ?? (gB>=80?'Strong':gB>=65?'Good':'Needs Work'), this._grade(gB), winnerHost ? (winnerHost === hostB) : false);

    return `
    <div class="cmp6-header">
      <div class="cmp6-site-col">
        <div class="cmp6-site-name"><i class="bi bi-globe2"></i> <a href="${this._e(a.url)}" target="_blank" rel="noopener">${this._e(hostA)}</a></div>
        ${ringA}
        <div class="cmp6-site-meta">${this._e(a.overview?.type || 'Website')} · ${(a.content?.wordCount||0).toLocaleString()} words</div>
      </div>
      <div class="cmp6-vs-col">
        ${winnerBadge}
        <div class="cmp6-vs-label">VS</div>
      </div>
      <div class="cmp6-site-col cmp6-site-col-b">
        <div class="cmp6-site-name"><i class="bi bi-globe2"></i> <a href="${this._e(b.url)}" target="_blank" rel="noopener">${this._e(hostB)}</a></div>
        ${ringB}
        <div class="cmp6-site-meta">${this._e(b.overview?.type || 'Website')} · ${(b.content?.wordCount||0).toLocaleString()} words</div>
      </div>
    </div>`;
  },

  _growthRing(score, color, label, grade, isWinner) {
    return `
    <div class="cmp6-ring-wrap">
      ${isWinner ? `<div class="cmp6-ring-winner"><i class="bi bi-trophy-fill"></i> Wins</div>` : '<div class="cmp6-ring-winner" style="visibility:hidden">·</div>'}
      <div class="cmp6-ring" style="border-color:${color};color:${color};box-shadow:0 0 28px ${color}28">
        <span class="cmp6-ring-val">${score}</span>
        <span class="cmp6-ring-sub">/ 100</span>
      </div>
      <div class="cmp6-ring-label" style="color:${color}">${label}</div>
      <div class="cmp6-ring-grade" style="background:${color}18;color:${color}">Grade ${grade}</div>
    </div>`;
  },

  // ── 2. ADVANTAGE SUMMARY ──────────────────────────────────────────────

  _advantageBlock(a, b, hostA, hostB) {
    const winsA = this._computeWins(a, b);
    const winsB = this._computeWins(b, a);
    if (!winsA.length && !winsB.length) return '';

    const col = (host, wins, color) => wins.length ? `
      <div class="cmp6-adv-col">
        <div class="cmp6-adv-head" style="color:${color}"><i class="bi bi-check-circle-fill"></i> ${this._e(host)} wins</div>
        ${wins.map(w => `
        <div class="cmp6-adv-item">
          <i class="bi bi-${w.icon}" style="color:${color}"></i>
          <span>${this._e(w.label)}</span>
        </div>`).join('')}
      </div>` : '';

    return `
    <div class="cmp6-adv-block">
      ${col(hostA, winsA, 'var(--green)')}
      ${col(hostB, winsB, 'var(--primary2)')}
    </div>`;
  },

  _computeWins(winner, loser) {
    const wins = [];
    const add  = (label, icon) => wins.push({ label, icon });

    const gW = winner.growth?.overall ?? winner.seo.score;
    const gL = loser.growth?.overall  ?? loser.seo.score;
    if (gW > gL + 5)  add(`Better overall Growth Score (+${gW - gL})`, 'graph-up-arrow');

    if (winner.seo.score > loser.seo.score + 5)
      add(`Higher SEO score (${winner.seo.score} vs ${loser.seo.score})`, 'graph-up-arrow');

    const pW = winner.growth?.categories?.performance ?? winner.performance?.score ?? 0;
    const pL = loser.growth?.categories?.performance  ?? loser.performance?.score  ?? 0;
    if (pW > pL + 5)  add('Faster performance score', 'speedometer2');

    const mW = winner.mobile?.score  ?? 0;
    const mL = loser.mobile?.score   ?? 0;
    if (mW > mL + 5)  add('Better mobile experience', 'phone-fill');

    const sW = winner.security?.score ?? 0;
    const sL = loser.security?.score  ?? 0;
    if (sW > sL + 5)  add('Stronger security score', 'shield-lock-fill');

    const cvW = winner.growth?.categories?.conversion ?? winner.conversion?.score ?? 0;
    const cvL = loser.growth?.categories?.conversion  ?? loser.conversion?.score  ?? 0;
    if (cvW > cvL + 5) add('Higher conversion score', 'cursor-fill');

    const bW = winner.growth?.categories?.business ?? winner.business?.score ?? 0;
    const bL = loser.growth?.categories?.business  ?? loser.business?.score  ?? 0;
    if (bW > bL + 5)  add('Better business readiness', 'building');

    if ((winner.cta?.primary?.length ?? 0) > 0 && (loser.cta?.primary?.length ?? 0) === 0)
      add('Has a clear primary CTA', 'cursor-fill');

    if ((winner.contacts?.emails?.length ?? 0) > 0 && (loser.contacts?.emails?.length ?? 0) === 0)
      add('Visible email contact', 'envelope-fill');

    if (winner.business?.hasTestimonials && !loser.business?.hasTestimonials)
      add('Testimonials present', 'chat-quote-fill');

    if (winner.security?.https && !loser.security?.https)
      add('HTTPS secured', 'lock-fill');

    if ((winner.tech?.detected?.length ?? 0) > (loser.tech?.detected?.length ?? 0))
      add(`Richer tech stack (${winner.tech.detected.length} detected)`, 'cpu-fill');

    if ((winner.content?.wordCount ?? 0) > (loser.content?.wordCount ?? 0) + 200)
      add('More content depth', 'file-text-fill');

    return wins.slice(0, 5);
  },

  // ── 3. CATEGORY BARS ──────────────────────────────────────────────────

  _categoryBars(a, b, hostA, hostB) {
    const cats = a.growth?.categories && b.growth?.categories ? [
      { key: 'seo',           label: 'SEO',               icon: 'graph-up-arrow',     color: 'var(--green)' },
      { key: 'performance',   label: 'Performance',       icon: 'speedometer2',        color: 'var(--yellow)' },
      { key: 'mobile',        label: 'Mobile',             icon: 'phone-fill',          color: 'var(--primary2)' },
      { key: 'security',      label: 'Security',           icon: 'shield-lock-fill',    color: 'var(--red)' },
      { key: 'conversion',    label: 'Conversion',         icon: 'cursor-fill',         color: '#f59e0b' },
      { key: 'business',      label: 'Business',           icon: 'building',            color: 'var(--accent)' },
      { key: 'content',       label: 'Content',            icon: 'file-text-fill',      color: 'var(--purple)' },
      { key: 'accessibility', label: 'Accessibility',      icon: 'universal-access',    color: '#ec4899' },
    ] : [
      { key: 'seo',        label: 'SEO',         icon: 'graph-up-arrow',  color: 'var(--green)',    va: a.seo.score,             vb: b.seo.score },
      { key: 'mobile',     label: 'Mobile',      icon: 'phone-fill',      color: 'var(--primary2)', va: a.mobile?.score ?? 0,    vb: b.mobile?.score ?? 0 },
      { key: 'security',   label: 'Security',    icon: 'shield-lock-fill',color: 'var(--red)',      va: a.security?.score ?? 0,  vb: b.security?.score ?? 0 },
      { key: 'performance',label: 'Performance', icon: 'speedometer2',    color: 'var(--yellow)',   va: a.performance?.score??0, vb: b.performance?.score??0 },
    ];

    const rows = cats.map(c => {
      const va = a.growth?.categories ? (a.growth.categories[c.key] ?? 0) : (c.va ?? 0);
      const vb = b.growth?.categories ? (b.growth.categories[c.key] ?? 0) : (c.vb ?? 0);
      const diff = va - vb;
      const wA = diff > 0, wB = diff < 0;
      const ca = this._scoreColor(va), cb = this._scoreColor(vb);

      return `
      <div class="cmp6-cat-row">
        <div class="cmp6-cat-score-a" style="color:${ca}">
          ${va}
          ${wA ? `<span class="cmp6-cat-badge" style="color:var(--green)">+${diff}</span>` : ''}
        </div>
        <div class="cmp6-cat-bars">
          <div class="cmp6-cat-bar-wrap cmp6-bar-left">
            <div class="cmp6-cat-bar-fill" style="width:${va}%;background:${ca};border-radius:4px 0 0 4px"></div>
          </div>
          <div class="cmp6-cat-label">
            <i class="bi bi-${c.icon}" style="color:${c.color}"></i>
            ${c.label}
          </div>
          <div class="cmp6-cat-bar-wrap cmp6-bar-right">
            <div class="cmp6-cat-bar-fill" style="width:${vb}%;background:${cb};border-radius:0 4px 4px 0"></div>
          </div>
        </div>
        <div class="cmp6-cat-score-b" style="color:${cb}">
          ${wB ? `<span class="cmp6-cat-badge" style="color:var(--green)">+${Math.abs(diff)}</span>` : ''}
          ${vb}
        </div>
      </div>`;
    }).join('');

    return `
    <div class="cmp6-section">
      <div class="cmp6-section-head">
        <i class="bi bi-bar-chart-fill"></i> Score Comparison
        <div class="cmp6-section-cols">
          <span>${this._e(hostA)}</span>
          <span></span>
          <span>${this._e(hostB)}</span>
        </div>
      </div>
      <div class="cmp6-cat-rows">${rows}</div>
    </div>`;
  },

  // ── 4. DETAIL SECTIONS ────────────────────────────────────────────────

  _detailSections(a, b, hostA, hostB) {
    const sec = (title, icon, color, content) => `
    <div class="cmp6-section">
      <div class="cmp6-section-head" style="border-left-color:${color}">
        <i class="bi bi-${icon}" style="color:${color}"></i> ${title}
      </div>
      <div class="cmp6-two-col">${content}</div>
    </div>`;

    const col = content => `<div class="cmp6-detail-col">${content}</div>`;

    const checkRow = (label, pass) => `
      <div class="cmp6-check"><i class="bi bi-${pass?'check-circle-fill':'x-circle-fill'}" style="color:${pass?'var(--green)':'var(--red)'}"></i>${label}</div>`;

    const kv = (label, val) => `
      <div class="cmp6-kv"><span class="cmp6-kv-label">${label}</span><span class="cmp6-kv-val">${this._e(String(val??'—'))}</span></div>`;

    // SEO detail
    const seoDetail = col(`
      ${kv('Score', a.seo.score + '/100')}
      ${kv('Title', a.seo.title ? a.seo.title.slice(0,50)+'…' : '—')}
      ${kv('Description', a.seo.metaDesc ? '✓ Set' : '✗ Missing')}
      ${kv('H1 / H2 / H3', `${a.seo.h1s.length} / ${(a.seo.h2s||[]).length} / ${(a.seo.h3s||[]).length}`)}
      ${kv('Missing alt', a.seo.noAlt)}
      ${checkRow('Meta Title',    !!a.seo.title)}
      ${checkRow('Meta Desc',     !!a.seo.metaDesc)}
      ${checkRow('OG Tags',       !!a.seo.ogTitle)}
      ${checkRow('Canonical',     !!a.seo.canonical)}
    `) + col(`
      ${kv('Score', b.seo.score + '/100')}
      ${kv('Title', b.seo.title ? b.seo.title.slice(0,50)+'…' : '—')}
      ${kv('Description', b.seo.metaDesc ? '✓ Set' : '✗ Missing')}
      ${kv('H1 / H2 / H3', `${b.seo.h1s.length} / ${(b.seo.h2s||[]).length} / ${(b.seo.h3s||[]).length}`)}
      ${kv('Missing alt', b.seo.noAlt)}
      ${checkRow('Meta Title',    !!b.seo.title)}
      ${checkRow('Meta Desc',     !!b.seo.metaDesc)}
      ${checkRow('OG Tags',       !!b.seo.ogTitle)}
      ${checkRow('Canonical',     !!b.seo.canonical)}
    `);

    // Keywords
    const kwBlock = d => `<div class="cmp6-tags">${
      (d.content?.keywords||[]).slice(0,10).map(k =>
        `<span class="cmp6-tag">${this._e(k.word)} <em>${k.density}%</em></span>`
      ).join('')||'<span style="color:var(--muted)">None</span>'
    }</div>`;

    // CTAs
    const ctaBlock = d => (d.cta?.primary||[]).concat(d.cta?.secondary||[]).slice(0,6).map(t =>
      `<div class="cmp6-cta-row"><span class="cmp6-cta-badge">CTA</span>${this._e(t)}</div>`
    ).join('') || `<span style="color:var(--muted);font-size:.85rem">None detected</span>`;

    // Tech
    const techBlock = d => d.tech?.detected?.length
      ? `<div class="cmp6-tags">${d.tech.detected.map(t=>`<span class="cmp6-tag cmp6-tag-tech"><span class="tdot"></span>${this._e(t)}</span>`).join('')}</div>`
      : `<span style="color:var(--muted);font-size:.85rem">None detected</span>`;

    // Colors
    const colorBlock = d => `<div class="cmp6-swatches">
      ${(d.colors?.colors||[]).slice(0,10).map(hex=>`
        <div class="cmp6-swatch" title="${hex}" onclick="UI.copy('${hex}')">
          <div style="background:${hex}"></div>
          <span>${hex}</span>
        </div>`).join('')}
    </div>`;

    // Fonts
    const fontBlock = d => d.fonts?.fonts?.length
      ? d.fonts.fonts.map(f=>`
        <div class="cmp6-font-row">
          <span class="cmp6-font-name" style="font-family:'${this._e(f.name)}',sans-serif">${this._e(f.name)}</span>
          <span class="cmp6-font-weight">${this._e(f.weights||'')}</span>
        </div>`).join('')
      : `<span style="color:var(--muted);font-size:.85rem">None detected</span>`;

    // Contacts
    const contactBlock = d => {
      const emails  = (d.contacts?.emails||[]).slice(0,3).map(e=>`<div class="cmp6-kv"><i class="bi bi-envelope-fill" style="color:var(--primary2)"></i><span>${this._e(e)}</span></div>`).join('');
      const phones  = (d.contacts?.phones||[]).slice(0,2).map(p=>`<div class="cmp6-kv"><i class="bi bi-telephone-fill" style="color:var(--green)"></i><span>${this._e(p)}</span></div>`).join('');
      const socials = Object.keys(d.contacts?.social||{}).slice(0,5).map(k=>`<span class="cmp6-tag">${this._e(k)}</span>`).join('');
      return (emails||`<div class="cmp6-kv" style="color:var(--muted)">No emails</div>`) + phones +
             (socials ? `<div class="cmp6-tags" style="margin-top:.5rem">${socials}</div>` : '');
    };

    // Performance detail
    const perfDetail = d => {
      const s = d.performance?.score ?? null;
      const c = s != null ? this._scoreColor(s) : 'var(--muted)';
      return `
        ${s != null ? `<div class="cmp6-score-mini" style="border-color:${c};color:${c}">${s}</div>` : ''}
        ${kv('HTML Size', d.performance?.htmlSizeKB + ' KB')}
        ${kv('Scripts',   d.performance?.scriptsCount)}
        ${kv('Images',    d.performance?.imagesCount)}
        ${kv('Lazy imgs', d.performance?.lazyImgs ?? '—')}
      `;
    };

    return `
      ${sec('SEO Analysis',    'graph-up-arrow',    'var(--green)',    seoDetail)}
      ${sec('Top Keywords',    'tags-fill',          'var(--primary2)', col(kwBlock(a)) + col(kwBlock(b)))}
      ${sec('Primary CTAs',   'cursor-fill',        '#f59e0b',        col(ctaBlock(a)) + col(ctaBlock(b)))}
      ${sec('Tech Stack',     'cpu-fill',           'var(--purple)',   col(techBlock(a)) + col(techBlock(b)))}
      ${sec('Color Palette',  'palette-fill',       '#ec4899',        col(colorBlock(a)) + col(colorBlock(b)))}
      ${sec('Typography',     'type',               'var(--accent)',   col(fontBlock(a)) + col(fontBlock(b)))}
      ${sec('Performance',    'speedometer2',       'var(--yellow)',   col(perfDetail(a)) + col(perfDetail(b)))}
      ${sec('Contact Info',   'person-lines-fill',  'var(--cyan,#00d4ff)', col(contactBlock(a)) + col(contactBlock(b)))}
    `;
  },
};
