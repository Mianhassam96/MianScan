const UI = {
    toast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2200);
    },

    renderOverview(data) {
        const { overview, colors, fonts, media, contacts, tech, seo, performance, structure } = data;

        // Banner
        document.getElementById('overviewBanner').innerHTML = `
            <div>
                <div class="ob-title">${overview.title}</div>
                <div class="ob-desc">${overview.desc || 'No description found'}</div>
            </div>
            <div class="ob-meta">
                <span class="ob-tag"><i class="bi bi-tag me-1"></i>${overview.type}</span>
                <span class="ob-tag"><i class="bi bi-translate me-1"></i>${overview.lang}</span>
                <span class="ob-tag"><i class="bi bi-layout-split me-1"></i>${overview.sections} sections</span>
                <span class="ob-tag"><i class="bi bi-lightbulb me-1"></i>${overview.topic}</span>
            </div>`;

        // Summary cards
        const cards = [
            { icon:'🎨', val: colors.total,            label:'Colors' },
            { icon:'🔤', val: fonts.total,             label:'Fonts' },
            { icon:'🖼️', val: media.totalImages,       label:'Images' },
            { icon:'📧', val: contacts.emails.length,  label:'Emails' },
            { icon:'⚙️', val: tech.scriptsCount,       label:'Scripts' },
            { icon:'📊', val: seo.score+'/100',        label:'SEO Score' },
            { icon:'🔗', val: structure.sections.Links,label:'Links' },
            { icon:'🛠️', val: tech.detected.length,    label:'Tech Found' },
        ];
        document.getElementById('summaryGrid').innerHTML = cards.map(c => `
            <div class="s-card fade-up">
                <div class="s-icon">${c.icon}</div>
                <div class="s-val">${c.val}</div>
                <div class="s-label">${c.label}</div>
            </div>`).join('');
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
            performance: () => this.tPerformance(data.performance),
        };
        document.getElementById('tabContent').innerHTML =
            `<div class="fade-up">${(map[tab] || map.overview)()}</div>`;
    },

    // ── Overview Tab ──
    tOverview(data) {
        return `<div class="row g-3">
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-info-circle"></i> Site Summary</h5>
                    ${this.row('URL', `<a href="${data.url}" target="_blank" style="color:var(--primary);word-break:break-all">${data.url}</a>`)}
                    ${this.row('Title', data.seo.title || '—')}
                    ${this.row('Type', data.overview.type)}
                    ${this.row('Language', data.overview.lang)}
                    ${this.row('Sections', data.overview.sections)}
                    ${this.row('Total Elements', data.structure.totalElements)}
                    ${this.row('HTML Size', data.performance.htmlSizeKB + ' KB')}
                    ${this.row('Scanned', new Date(data.scannedAt).toLocaleString())}
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-shield-check"></i> Quick Checks</h5>
                    ${this.check('Meta Title',       !!data.seo.title)}
                    ${this.check('Meta Description', !!data.seo.metaDesc)}
                    ${this.check('H1 Tag',           data.seo.h1s.length === 1)}
                    ${this.check('OG Tags',          !!data.seo.ogTitle)}
                    ${this.check('Viewport Meta',    !!data.seo.viewport)}
                    ${this.check('Images with Alt',  data.seo.noAlt === 0)}
                    ${this.check('Tech Detected',    data.tech.detected.length > 0)}
                    ${this.check('Contact Info',     data.contacts.emails.length > 0 || Object.keys(data.contacts.social).length > 0)}
                </div>
            </div>
        </div>`;
    },

    row(label, val) {
        return `<div class="seo-row"><span class="seo-lbl">${label}</span><span class="seo-val">${val}</span></div>`;
    },

    check(label, pass) {
        return `<div class="seo-row">
            <span class="seo-lbl">${label}</span>
            <span class="seo-val">${pass
                ? '<span style="color:var(--success)"><i class="bi bi-check-circle-fill"></i> Pass</span>'
                : '<span style="color:var(--danger)"><i class="bi bi-x-circle-fill"></i> Fail</span>'}</span>
        </div>`;
    },

    // ── Colors Tab ──
    tColors(colors) {
        if (!colors.colors.length) return this.empty('No colors detected');
        return `
        <div class="r-card">
            <h5><i class="bi bi-palette"></i> Color Palette <span class="badge">${colors.total}</span></h5>
            <div class="color-grid">
                ${colors.colors.map(hex => `
                    <div class="color-item" onclick="UI.copyVal('${hex}')" title="Click to copy ${hex}">
                        <div class="color-swatch" style="background:${hex}"></div>
                        <span class="color-hex">${hex}</span>
                        <span class="color-hex" style="font-size:.62rem">${ColorAnalyzer.toRgb(hex)}</span>
                    </div>`).join('')}
            </div>
        </div>
        <div class="r-card">
            <h5><i class="bi bi-code-slash"></i> CSS Variables</h5>
            <pre style="color:var(--muted);font-size:.8rem;overflow-x:auto;line-height:1.7">:root {\n${colors.colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}</pre>
            <button class="export-btn mt-2" onclick="UI.copyCSSVars(${JSON.stringify(colors.colors)})">
                <i class="bi bi-clipboard"></i> Copy CSS Variables
            </button>
        </div>`;
    },

    // ── Fonts Tab ──
    tFonts(fonts) {
        if (!fonts.fonts.length) return this.empty('No custom fonts detected');
        return `<div class="r-card">
            <h5><i class="bi bi-type"></i> Detected Fonts <span class="badge">${fonts.total}</span></h5>
            ${fonts.fonts.map(f => `
                <div class="font-item">
                    <div>
                        <div class="font-preview" style="font-family:'${f.name}',sans-serif">${f.name}</div>
                        <div class="font-meta">Weight: ${f.weights}${f.googleFont ? ' · <a href="'+f.googleLink+'" target="_blank" style="color:var(--primary)">Google Font ↗</a>' : ''}</div>
                    </div>
                    <button class="export-btn" onclick="UI.copyVal('@import url(\\'https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.name)}:wght@400;700&display=swap\\');')">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>`).join('')}
        </div>`;
    },

    // ── Structure Tab ──
    tStructure(structure) {
        return `<div class="row g-3">
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-diagram-3"></i> Layout Tree</h5>
                    ${structure.tree.map(item => `
                        <div class="tree-item">
                            <i class="bi bi-${item.icon}"></i>
                            <span>${item.label}</span>
                            <span class="tree-count">${item.count}</span>
                        </div>`).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-bar-chart"></i> Element Counts</h5>
                    ${Object.entries(structure.sections).map(([k,v]) => `
                        <div class="perf-row">
                            <span class="perf-lbl">${k}</span>
                            <span class="perf-val">${v}</span>
                        </div>`).join('')}
                </div>
            </div>
        </div>`;
    },

    // ── Content Tab ──
    tContent(content) {
        return `<div class="row g-3">
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-card-heading"></i> Headings</h5>
                    ${content.headings.length
                        ? content.headings.map(h => `<div class="contact-item"><i class="bi bi-chevron-right"></i>${h}</div>`).join('')
                        : this.empty('No headings found')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-lightbulb"></i> Topics</h5>
                    ${content.topics.length
                        ? content.topics.map(t => `<div class="contact-item"><i class="bi bi-dot"></i>${t}</div>`).join('')
                        : this.empty('No topics extracted')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-tags"></i> Keywords</h5>
                    <div class="tag-list">${content.keywords.map(k => `<span class="tag">${k}</span>`).join('')}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-hash"></i> Meta Tags</h5>
                    ${content.tags.length
                        ? `<div class="tag-list">${content.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>`
                        : this.empty('No meta keywords found')}
                </div>
            </div>
        </div>`;
    },

    // ── CTA Tab ──
    tCTA(cta) {
        const section = (label, items) => items.length ? `
            <div class="r-card">
                <h5><i class="bi bi-cursor"></i> ${label}</h5>
                ${items.map(t => `<div class="cta-item"><span class="cta-type">${label.split(' ')[0]}</span>${t}</div>`).join('')}
            </div>` : '';

        return `
            ${section('Primary CTA', cta.primary)}
            ${section('Secondary CTA', cta.secondary)}
            <div class="r-card">
                <h5><i class="bi bi-list-ul"></i> All Buttons / Links</h5>
                <div class="tag-list">${cta.all.map(t => `<span class="tag">${t}</span>`).join('') || '<span class="text-muted small">None found</span>'}</div>
            </div>`;
    },

    // ── SEO Tab ──
    tSEO(seo) {
        const cls = seo.score >= 70 ? 'score-good' : seo.score >= 50 ? 'score-ok' : 'score-bad';
        return `<div class="row g-3">
            <div class="col-md-4 text-center">
                <div class="r-card">
                    <h5><i class="bi bi-graph-up"></i> SEO Score</h5>
                    <div class="seo-score-ring ${cls}">${seo.score}</div>
                    <p style="color:var(--muted);font-size:.85rem">${seo.score>=70?'Good':seo.score>=50?'Needs Work':'Poor'}</p>
                    <div style="font-size:.8rem;color:var(--muted);margin-top:.5rem">
                        ${seo.imagesTotal} images · ${seo.withAlt} with alt · ${seo.noAlt} missing
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="r-card">
                    <h5><i class="bi bi-list-check"></i> Meta Tags</h5>
                    ${this.row('Title',        seo.title    || '<em style="color:var(--danger)">Missing</em>')}
                    ${this.row('Description',  seo.metaDesc || '<em style="color:var(--danger)">Missing</em>')}
                    ${this.row('Keywords',     seo.metaKw   || '<em style="color:var(--muted)">None</em>')}
                    ${this.row('Canonical',    seo.canonical|| '<em style="color:var(--muted)">None</em>')}
                    ${this.row('OG Title',     seo.ogTitle  || '<em style="color:var(--muted)">None</em>')}
                    ${this.row('OG Image',     seo.ogImage  ? `<a href="${seo.ogImage}" target="_blank" style="color:var(--primary)">View ↗</a>` : '<em style="color:var(--muted)">None</em>')}
                    ${this.row('Twitter Card', seo.twitterCard || '<em style="color:var(--muted)">None</em>')}
                    ${this.row('Viewport',     seo.viewport || '<em style="color:var(--danger)">Missing</em>')}
                </div>
            </div>
            <div class="col-12">
                <div class="r-card">
                    <h5><i class="bi bi-type-h1"></i> Heading Tags</h5>
                    ${seo.h1s.length
                        ? seo.h1s.map(h=>`<div class="contact-item"><span class="cta-type">H1</span>${h}</div>`).join('')
                        : '<div class="a11y-item a11y-warn"><i class="bi bi-exclamation-triangle"></i> No H1 found</div>'}
                    ${seo.h2s.map(h=>`<div class="contact-item"><span class="cta-type" style="background:var(--bg3);color:var(--muted)">H2</span>${h}</div>`).join('')}
                </div>
            </div>
        </div>`;
    },

    // ── Media Tab ──
    tMedia(media) {
        const placeholder = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='75'><rect fill='%23334155' width='110' height='75'/><text x='50%25' y='50%25' fill='%2394a3b8' text-anchor='middle' dy='.3em' font-size='11'>No Preview</text></svg>`;
        return `
        <div class="r-card">
            <h5><i class="bi bi-images"></i> Images <span class="badge">${media.totalImages}</span></h5>
            ${media.images.length ? `
                <div class="media-grid">
                    ${media.images.map(img => `
                        <div class="media-item" title="${img.alt || img.src}">
                            <img src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.src='${placeholder}'">
                            <div class="media-name">${img.alt || img.src.split('/').pop() || 'image'}</div>
                        </div>`).join('')}
                </div>` : this.empty('No images found')}
        </div>
        ${media.videos.length ? `
        <div class="r-card">
            <h5><i class="bi bi-play-circle"></i> Videos <span class="badge">${media.totalVideos}</span></h5>
            ${media.videos.map(v=>`<div class="contact-item"><i class="bi bi-play-fill"></i><a href="${v.src}" target="_blank">${v.src}</a></div>`).join('')}
        </div>` : ''}`;
    },

    // ── Contacts Tab ──
    tContacts(contacts) {
        const socialIcon = { Twitter:'twitter', Facebook:'facebook', LinkedIn:'linkedin', Instagram:'instagram', YouTube:'youtube', GitHub:'github', WhatsApp:'whatsapp' };
        return `<div class="row g-3">
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-envelope"></i> Emails</h5>
                    ${contacts.emails.length
                        ? contacts.emails.map(e=>`<div class="contact-item"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}">${e}</a></div>`).join('')
                        : this.empty('No emails found')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-telephone"></i> Phone Numbers</h5>
                    ${contacts.phones.length
                        ? contacts.phones.map(p=>`<div class="contact-item"><i class="bi bi-telephone-fill"></i><a href="tel:${p}">${p}</a></div>`).join('')
                        : this.empty('No phone numbers found')}
                </div>
            </div>
            <div class="col-12">
                <div class="r-card">
                    <h5><i class="bi bi-share"></i> Social Media</h5>
                    ${Object.entries(contacts.social).length
                        ? Object.entries(contacts.social).map(([k,url])=>`
                            <div class="contact-item">
                                <i class="bi bi-${socialIcon[k]||'link'}"></i>
                                <a href="${url}" target="_blank">${url}</a>
                            </div>`).join('')
                        : this.empty('No social links found')}
                </div>
            </div>
        </div>`;
    },

    // ── Tech Tab ──
    tTech(tech) {
        return `
        <div class="r-card">
            <h5><i class="bi bi-cpu"></i> Detected Technologies <span class="badge">${tech.detected.length}</span></h5>
            <div class="tech-wrap mt-1">
                ${tech.detected.length
                    ? tech.detected.map(t=>`<span class="tech-badge"><span class="tech-dot"></span>${t}</span>`).join('')
                    : this.empty('No technologies detected')}
            </div>
        </div>
        <div class="r-card">
            <h5><i class="bi bi-file-code"></i> Script Sources <span class="badge">${tech.scriptsCount}</span></h5>
            ${tech.scriptSrcs.length
                ? tech.scriptSrcs.map(s=>`<div class="contact-item" style="font-size:.78rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all">${s}</span></div>`).join('')
                : this.empty('No external scripts')}
        </div>`;
    },

    // ── Performance Tab ──
    tPerformance(perf) {
        return `<div class="row g-3">
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-speedometer2"></i> Page Metrics</h5>
                    <div class="perf-row"><span class="perf-lbl">HTML Size</span><span class="perf-val">${perf.htmlSizeKB} KB</span></div>
                    <div class="perf-row"><span class="perf-lbl">Scripts</span><span class="perf-val">${perf.scriptsCount}</span></div>
                    <div class="perf-row"><span class="perf-lbl">Stylesheets</span><span class="perf-val">${perf.stylesCount}</span></div>
                    <div class="perf-row"><span class="perf-lbl">Images</span><span class="perf-val">${perf.imagesCount}</span></div>
                    <div class="perf-row"><span class="perf-lbl">Iframes</span><span class="perf-val">${perf.iframesCount}</span></div>
                    <div class="perf-row"><span class="perf-lbl">Inline Script Size</span><span class="perf-val">${perf.inlineKB} KB</span></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="r-card">
                    <h5><i class="bi bi-universal-access"></i> Accessibility</h5>
                    ${perf.a11y.map(w=>`
                        <div class="a11y-item ${w.ok?'a11y-ok':'a11y-warn'}">
                            <i class="bi bi-${w.ok?'check-circle':'exclamation-triangle'}"></i>
                            ${w.msg}
                        </div>`).join('')}
                </div>
            </div>
        </div>`;
    },

    empty(msg) {
        return `<div class="empty"><i class="bi bi-inbox"></i>${msg}</div>`;
    },

    copyVal(val) {
        navigator.clipboard.writeText(val).then(() => this.toast('Copied: ' + val));
    },

    copyCSSVars(colors) {
        const css = `:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}`;
        navigator.clipboard.writeText(css).then(() => this.toast('CSS variables copied!'));
    }
};
