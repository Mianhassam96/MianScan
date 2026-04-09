const UI = {
    renderOverview(data) {
        const { colors, fonts, media, contacts, tech, seo, performance } = data;
        const cards = [
            { icon: '🎨', value: colors.total, label: 'Colors' },
            { icon: '🔤', value: fonts.total, label: 'Fonts' },
            { icon: '🖼️', value: media.totalImages, label: 'Images' },
            { icon: '📧', value: contacts.emails.length, label: 'Emails' },
            { icon: '⚙️', value: tech.scriptsCount, label: 'Scripts' },
            { icon: '📊', value: seo.score + '/100', label: 'SEO Score' },
            { icon: '🔗', value: data.structure.sections.links, label: 'Links' },
            { icon: '🛠️', value: tech.detected.length, label: 'Tech Found' },
        ];
        document.getElementById('overviewCards').innerHTML = cards.map(c => `
            <div class="ov-card fade-up">
                <div class="ov-icon">${c.icon}</div>
                <div class="ov-value">${c.value}</div>
                <div class="ov-label">${c.label}</div>
            </div>
        `).join('');
    },

    renderTab(tab, data) {
        const container = document.getElementById('tabContent');
        let html = '';

        switch (tab) {
            case 'overview': html = this.tabOverview(data); break;
            case 'colors': html = this.tabColors(data.colors); break;
            case 'fonts': html = this.tabFonts(data.fonts); break;
            case 'structure': html = this.tabStructure(data.structure); break;
            case 'content': html = this.tabContent(data.content); break;
            case 'seo': html = this.tabSEO(data.seo); break;
            case 'media': html = this.tabMedia(data.media); break;
            case 'contacts': html = this.tabContacts(data.contacts); break;
            case 'tech': html = this.tabTech(data.tech); break;
            case 'performance': html = this.tabPerformance(data.performance); break;
        }

        container.innerHTML = `<div class="tab-panel active fade-up">${html}</div>`;
    },

    tabOverview(data) {
        return `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-info-circle"></i> Scan Summary</h5>
                    <div class="seo-item"><span class="seo-label">URL</span><span class="seo-value">${data.url}</span></div>
                    <div class="seo-item"><span class="seo-label">Scanned At</span><span class="seo-value">${new Date(data.scannedAt).toLocaleString()}</span></div>
                    <div class="seo-item"><span class="seo-label">Page Title</span><span class="seo-value">${data.seo.title || '—'}</span></div>
                    <div class="seo-item"><span class="seo-label">Total Elements</span><span class="seo-value">${data.structure.totalElements}</span></div>
                    <div class="seo-item"><span class="seo-label">HTML Size</span><span class="seo-value">${data.performance.htmlSizeKB} KB</span></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-shield-check"></i> Quick Checks</h5>
                    ${this.quickCheck('Meta Title', !!data.seo.title)}
                    ${this.quickCheck('Meta Description', !!data.seo.metaDesc)}
                    ${this.quickCheck('H1 Tag', data.seo.h1s.length === 1)}
                    ${this.quickCheck('OG Tags', !!data.seo.ogTitle)}
                    ${this.quickCheck('Viewport Meta', !!data.seo.viewport)}
                    ${this.quickCheck('Images with Alt', data.seo.imagesWithoutAlt === 0)}
                </div>
            </div>
        </div>`;
    },

    quickCheck(label, pass) {
        return `<div class="seo-item">
            <span class="seo-label">${label}</span>
            <span class="seo-value">${pass ? '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Pass</span>' : '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Fail</span>'}</span>
        </div>`;
    },

    tabColors(colors) {
        if (!colors.colors.length) return this.empty('No colors detected');
        return `
        <div class="result-card">
            <h5><i class="bi bi-palette"></i> Extracted Colors <span class="badge bg-primary ms-2">${colors.total}</span></h5>
            <div class="color-grid">
                ${colors.colors.map(hex => `
                    <div class="color-item" onclick="UI.copyColor('${hex}')" title="Click to copy">
                        <div class="color-swatch" style="background:${hex}"></div>
                        <span class="color-hex">${hex}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="result-card">
            <h5><i class="bi bi-code-slash"></i> CSS Variables</h5>
            <pre style="color:var(--text-muted);font-size:0.8rem;overflow-x:auto">:root {\n${colors.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}</pre>
            <button class="btn btn-sm btn-export mt-2" onclick="UI.copyCSSVars(${JSON.stringify(colors.colors)})"><i class="bi bi-clipboard me-1"></i>Copy CSS Variables</button>
        </div>`;
    },

    tabFonts(fonts) {
        if (!fonts.fonts.length) return this.empty('No custom fonts detected');
        return `
        <div class="result-card">
            <h5><i class="bi bi-type"></i> Detected Fonts <span class="badge bg-primary ms-2">${fonts.total}</span></h5>
            ${fonts.fonts.map(f => `
                <div class="font-item">
                    <div>
                        <div class="font-preview" style="font-family:'${f.name}',sans-serif">${f.name}</div>
                        <div class="font-meta">Weight: ${f.weights || '400'} ${f.googleFont ? '· <a href="' + f.googleLink + '" target="_blank" style="color:var(--primary)">Google Font ↗</a>' : ''}</div>
                    </div>
                    <button class="btn btn-sm btn-export" onclick="UI.copyText('@import url(\\'https://fonts.googleapis.com/css2?family=${f.name.replace(/ /g, '+')}:wght@400;700&display=swap\\');')">Copy Import</button>
                </div>
            `).join('')}
        </div>`;
    },

    tabStructure(structure) {
        return `
        <div class="result-card">
            <h5><i class="bi bi-diagram-3"></i> Layout Tree</h5>
            <div class="structure-tree">
                ${structure.tree.map(item => `
                    <div class="tree-item">
                        <i class="bi bi-${item.icon} tree-icon"></i>
                        <span>${item.label}</span>
                        <span class="tree-count">${item.count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="result-card">
            <h5><i class="bi bi-bar-chart"></i> Element Counts</h5>
            ${Object.entries(structure.sections).map(([k, v]) => `
                <div class="perf-item">
                    <span class="perf-label">${k.charAt(0).toUpperCase() + k.slice(1)}</span>
                    <span class="perf-value">${v}</span>
                </div>
            `).join('')}
        </div>`;
    },

    tabContent(content) {
        return `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-card-heading"></i> Headings</h5>
                    ${content.headings.length ? content.headings.map(h => `<div class="contact-item"><i class="bi bi-chevron-right"></i>${h}</div>`).join('') : this.empty('No headings found')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-tags"></i> Keywords</h5>
                    <div class="tag-list">${content.keywords.map(k => `<span class="tag">${k}</span>`).join('')}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-lightbulb"></i> Topics</h5>
                    ${content.topics.length ? content.topics.map(t => `<div class="contact-item"><i class="bi bi-dot"></i>${t}</div>`).join('') : this.empty('No topics extracted')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-cursor-text"></i> Buttons / CTAs</h5>
                    <div class="tag-list">${content.buttons.map(b => `<span class="tag">${b}</span>`).join('') || '<span class="text-muted small">None found</span>'}</div>
                </div>
            </div>
        </div>`;
    },

    tabSEO(seo) {
        const scoreClass = seo.score >= 70 ? 'score-good' : seo.score >= 50 ? 'score-ok' : 'score-bad';
        return `
        <div class="row g-3">
            <div class="col-md-4 text-center">
                <div class="result-card">
                    <h5><i class="bi bi-graph-up"></i> SEO Score</h5>
                    <div class="seo-score-ring ${scoreClass}">${seo.score}</div>
                    <p class="text-muted small">${seo.score >= 70 ? 'Good' : seo.score >= 50 ? 'Needs Work' : 'Poor'}</p>
                </div>
            </div>
            <div class="col-md-8">
                <div class="result-card">
                    <h5><i class="bi bi-list-check"></i> Meta Tags</h5>
                    <div class="seo-item"><span class="seo-label">Title</span><span class="seo-value">${seo.title || '<em class="text-danger">Missing</em>'}</span></div>
                    <div class="seo-item"><span class="seo-label">Description</span><span class="seo-value">${seo.metaDesc || '<em class="text-danger">Missing</em>'}</span></div>
                    <div class="seo-item"><span class="seo-label">Keywords</span><span class="seo-value">${seo.metaKeywords || '<em class="text-muted">None</em>'}</span></div>
                    <div class="seo-item"><span class="seo-label">Canonical</span><span class="seo-value">${seo.canonical || '<em class="text-muted">None</em>'}</span></div>
                    <div class="seo-item"><span class="seo-label">OG Title</span><span class="seo-value">${seo.ogTitle || '<em class="text-muted">None</em>'}</span></div>
                    <div class="seo-item"><span class="seo-label">Twitter Card</span><span class="seo-value">${seo.twitterCard || '<em class="text-muted">None</em>'}</span></div>
                </div>
            </div>
            <div class="col-12">
                <div class="result-card">
                    <h5><i class="bi bi-type-h1"></i> Heading Tags</h5>
                    ${seo.h1s.length ? seo.h1s.map(h => `<div class="contact-item"><span class="tag me-2">H1</span>${h}</div>`).join('') : '<div class="a11y-warn"><i class="bi bi-exclamation-triangle"></i> No H1 found</div>'}
                    ${seo.h2s.map(h => `<div class="contact-item"><span class="tag me-2" style="opacity:0.7">H2</span>${h}</div>`).join('')}
                </div>
            </div>
        </div>`;
    },

    tabMedia(media) {
        return `
        <div class="result-card">
            <h5><i class="bi bi-images"></i> Images <span class="badge bg-primary ms-2">${media.totalImages}</span></h5>
            ${media.images.length ? `<div class="media-grid">${media.images.map(img => `
                <div class="media-item">
                    <img src="${img.src}" alt="${img.alt}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22><rect fill=%22%23334155%22 width=%22120%22 height=%2280%22/><text x=%2250%%22 y=%2250%%22 fill=%22%2394a3b8%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22>No Preview</text></svg>'">
                    <div class="media-name">${img.alt || img.src.split('/').pop() || 'image'}</div>
                </div>
            `).join('')}</div>` : this.empty('No images found')}
        </div>
        ${media.videos.length ? `<div class="result-card">
            <h5><i class="bi bi-play-circle"></i> Videos <span class="badge bg-primary ms-2">${media.totalVideos}</span></h5>
            ${media.videos.map(v => `<div class="contact-item"><i class="bi bi-play-fill"></i><a href="${v.src}" target="_blank">${v.src}</a></div>`).join('')}
        </div>` : ''}`;
    },

    tabContacts(contacts) {
        const socialIcons = { twitter: 'twitter', facebook: 'facebook', linkedin: 'linkedin', instagram: 'instagram', youtube: 'youtube', github: 'github', whatsapp: 'whatsapp' };
        return `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-envelope"></i> Emails</h5>
                    ${contacts.emails.length ? contacts.emails.map(e => `<div class="contact-item"><i class="bi bi-envelope-fill"></i><a href="mailto:${e}">${e}</a></div>`).join('') : this.empty('No emails found')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-telephone"></i> Phone Numbers</h5>
                    ${contacts.phones.length ? contacts.phones.map(p => `<div class="contact-item"><i class="bi bi-telephone-fill"></i><a href="tel:${p}">${p}</a></div>`).join('') : this.empty('No phone numbers found')}
                </div>
            </div>
            <div class="col-12">
                <div class="result-card">
                    <h5><i class="bi bi-share"></i> Social Media</h5>
                    ${Object.entries(contacts.socials).filter(([, v]) => v.length).map(([k, urls]) =>
                        urls.map(url => `<div class="contact-item"><i class="bi bi-${socialIcons[k]}"></i><a href="${url}" target="_blank">${url}</a></div>`).join('')
                    ).join('') || this.empty('No social links found')}
                </div>
            </div>
        </div>`;
    },

    tabTech(tech) {
        return `
        <div class="result-card">
            <h5><i class="bi bi-cpu"></i> Detected Technologies <span class="badge bg-primary ms-2">${tech.detected.length}</span></h5>
            <div class="mt-2">
                ${tech.detected.length ? tech.detected.map(t => `<span class="tech-badge"><span class="tech-dot"></span>${t}</span>`).join('') : this.empty('No technologies detected')}
            </div>
        </div>
        <div class="result-card">
            <h5><i class="bi bi-file-code"></i> Script Sources <span class="badge bg-secondary ms-2">${tech.scriptsCount}</span></h5>
            ${tech.scriptSrcs.map(s => `<div class="contact-item" style="font-size:0.8rem"><i class="bi bi-code-slash"></i><span style="word-break:break-all">${s}</span></div>`).join('') || this.empty('No external scripts')}
        </div>`;
    },

    tabPerformance(perf) {
        return `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-speedometer2"></i> Page Metrics</h5>
                    <div class="perf-item"><span class="perf-label">HTML Size</span><span class="perf-value">${perf.htmlSizeKB} KB</span></div>
                    <div class="perf-item"><span class="perf-label">Scripts</span><span class="perf-value">${perf.scriptsCount}</span></div>
                    <div class="perf-item"><span class="perf-label">Stylesheets</span><span class="perf-value">${perf.stylesCount}</span></div>
                    <div class="perf-item"><span class="perf-label">Images</span><span class="perf-value">${perf.imagesCount}</span></div>
                    <div class="perf-item"><span class="perf-label">Iframes</span><span class="perf-value">${perf.iframesCount}</span></div>
                    <div class="perf-item"><span class="perf-label">Inline Script Size</span><span class="perf-value">${perf.inlineScriptSizeKB} KB</span></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="result-card">
                    <h5><i class="bi bi-universal-access"></i> Accessibility</h5>
                    ${perf.a11yWarnings.map(w => `
                        <div class="a11y-warn ${w.type === 'ok' ? 'a11y-ok' : ''}">
                            <i class="bi bi-${w.type === 'ok' ? 'check-circle' : 'exclamation-triangle'}"></i>
                            ${w.msg}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;
    },

    empty(msg) {
        return `<div class="empty-state"><i class="bi bi-inbox"></i><p>${msg}</p></div>`;
    },

    copyColor(hex) {
        navigator.clipboard.writeText(hex).then(() => this.toast('Copied: ' + hex));
    },

    copyCSSVars(colors) {
        const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
        navigator.clipboard.writeText(css).then(() => this.toast('CSS variables copied!'));
    },

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => this.toast('Copied!'));
    },

    toast(msg) {
        let t = document.querySelector('.copy-toast');
        if (!t) { t = document.createElement('div'); t.className = 'copy-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
};
