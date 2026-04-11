const Exporter = {
  downloadCSS(colors) {
    const hostname = Scanner.currentData ? new URL(Scanner.currentData.url).hostname : 'site';
    const css = `/* MianScan Color Export — ${hostname} */\n:root {\n${colors.map((c,i)=>`  --color-${i+1}: ${c};`).join('\n')}\n}\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([css], {type:'text/css'}));
    a.download = `colors-${hostname}.css`;
    a.click(); URL.revokeObjectURL(a.href);
    UI.toast('CSS file downloaded!');
  },

  toJSON(data) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download = `mianscan-${new URL(data.url).hostname}-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    UI.toast('JSON exported!');
  },

  toPDF(data) {
    if (typeof window.jspdf === 'undefined') { UI.toast('PDF library not loaded'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(); let y = 22;
    const hostname = new URL(data.url).hostname;

    const addPage = () => { doc.addPage(); y = 22; };
    const checkY  = (needed = 10) => { if (y + needed > 278) addPage(); };

    // ── Gradient-style header bar
    doc.setFillColor(100, 112, 255);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setFillColor(168, 85, 247);
    doc.rect(140, 0, 70, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13); doc.setFont(undefined, 'bold');
    doc.text('MianScan Report', 14, 14);
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text(hostname, 145, 9);
    doc.text(new Date(data.scannedAt).toLocaleDateString(), 145, 16);
    doc.setTextColor(30, 30, 30);
    y = 30;

    // ── Score summary bar
    const seoScore  = data.seo.score;
    const perfScore = data.performance?.score ?? '—';
    const mobScore  = data.mobile?.score ?? '—';
    const secScore  = data.security?.score ?? '—';
    const scoreColor = s => s >= 70 ? [34,197,94] : s >= 50 ? [245,158,11] : [240,68,68];

    const scoreBoxes = [
      { label: 'SEO', val: seoScore },
      { label: 'Perf', val: perfScore },
      { label: 'Mobile', val: mobScore },
      { label: 'Security', val: secScore },
    ];
    scoreBoxes.forEach((b, i) => {
      const x = 14 + i * 46;
      const col = typeof b.val === 'number' ? scoreColor(b.val) : [150,150,150];
      doc.setFillColor(...col);
      doc.roundedRect(x, y, 40, 18, 3, 3, 'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(14); doc.setFont(undefined, 'bold');
      doc.text(String(b.val), x + 20, y + 10, { align: 'center' });
      doc.setFontSize(7); doc.setFont(undefined, 'normal');
      doc.text(b.label, x + 20, y + 16, { align: 'center' });
    });
    doc.setTextColor(30,30,30);
    y += 26;

    const section = (title, color = [100,112,255]) => {
      checkY(14);
      y += 2;
      doc.setFillColor(...color);
      doc.rect(14, y - 4, 182, 8, 'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.text(title, 17, y + 1);
      doc.setTextColor(30,30,30);
      y += 10; doc.setFontSize(8.5);
    };

    const row = (label, val) => {
      checkY(7);
      doc.setFont(undefined, 'bold'); doc.setTextColor(90,106,133);
      doc.text(label + ':', 16, y);
      doc.setFont(undefined, 'normal'); doc.setTextColor(30,30,30);
      const lines = doc.splitTextToSize(String(val || '—'), 128);
      doc.text(lines, 68, y);
      y += lines.length * 5 + 1.5;
    };

    const check = (label, pass) => {
      checkY(6);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(pass ? 34 : 240, pass ? 197 : 68, pass ? 94 : 68);
      doc.text(pass ? '✓' : '✗', 16, y);
      doc.setTextColor(30,30,30);
      doc.text(label, 24, y);
      y += 5.5;
    };

    // ── Overview
    section('Overview');
    row('URL',      data.url);
    row('Title',    data.overview.title);
    row('Type',     data.overview.type);
    row('Language', data.overview.lang);
    row('Words',    (data.content.wordCount||0).toLocaleString());
    row('HTML Size',data.performance.htmlSizeKB + ' KB');
    row('Scanned',  new Date(data.scannedAt).toLocaleString());

    // ── SEO
    section('SEO Analysis', [34,197,94]);
    row('Score',       data.seo.score + '/100');
    row('Title',       data.seo.title || '—');
    row('Description', data.seo.metaDesc || '—');
    row('H1 Tags',     data.seo.h1s.join(', ') || 'None');
    row('H2 Tags',     (data.seo.h2s||[]).length + ' found');
    row('Canonical',   data.seo.canonical || 'Not set');
    y += 1;
    check('Meta Title',       !!data.seo.title);
    check('Meta Description', !!data.seo.metaDesc);
    check('Single H1',        data.seo.h1s.length === 1);
    check('OG Tags',          !!data.seo.ogTitle);
    check('All Images Alt',   data.seo.noAlt === 0);
    check('Canonical Set',    !!data.seo.canonical);
    check('Viewport Meta',    !!data.seo.viewport);

    // ── Performance
    section('Performance', [245,158,11]);
    row('Score',       (data.performance?.score ?? '—') + (data.performance?.grade ? ' (Grade ' + data.performance.grade + ')' : ''));
    row('HTML Size',   data.performance.htmlSizeKB + ' KB');
    row('Scripts',     data.performance.scriptsCount);
    row('Stylesheets', data.performance.stylesCount);
    row('Images',      data.performance.imagesCount);
    row('Lazy Images', data.performance.lazyImgs ?? '—');
    row('Iframes',     data.performance.iframesCount);
    if (data.ranking?.perfScore != null) {
      row('PageSpeed (Mobile)', data.ranking.perfScore + '/100');
      if (data.ranking.fcp) row('FCP', data.ranking.fcp);
      if (data.ranking.lcp) row('LCP', data.ranking.lcp);
    }

    // ── Security
    section('Security', [240,68,68]);
    row('Score', (data.security?.score ?? '—') + ' / Grade ' + (data.security?.grade ?? '?'));
    row('HTTPS', data.security?.https ? 'Yes — Secure' : 'No — Insecure');
    (data.security?.checks || []).slice(0, 6).forEach(c => check(c.label, c.type === 'ok'));

    // ── Mobile
    section('Mobile Friendliness', [34,197,94]);
    row('Score', (data.mobile?.score ?? '—') + ' / Grade ' + (data.mobile?.grade ?? '?'));
    (data.mobile?.checks || []).slice(0, 5).forEach(c => check(c.label, c.type === 'ok'));

    // ── Domain & Ranking
    section('Domain & Ranking', [168,85,247]);
    row('Domain',      data.domain?.hostname || hostname);
    row('Domain Auth', data.domain?.da != null ? data.domain.da + '/10 (' + (data.domain.daNote||'') + ')' : 'N/A');
    row('Global Rank', data.ranking?.globalRank ? '#' + Number(data.ranking.globalRank).toLocaleString() : 'N/A');
    row('IP Address',  data.domain?.ip || 'N/A');
    row('Country',     data.domain?.country || 'N/A');
    row('Registered',  data.domain?.age || 'Unknown');

    // ── Tech Stack
    section('Tech Stack', [0,212,255]);
    row('Detected', data.tech.detected.join(', ') || 'None');
    row('Scripts',  data.performance.scriptsCount);

    // ── Colors with swatches
    section('Color Palette', [236,72,153]);
    row('Total Found', data.colors.total);
    checkY(22);
    y += 2;
    data.colors.colors.slice(0, 16).forEach((hex, i) => {
      const x  = 16 + (i % 8) * 21;
      const sy = y + Math.floor(i / 8) * 16;
      const r  = parseInt(hex.slice(1,3),16);
      const g  = parseInt(hex.slice(3,5),16);
      const b  = parseInt(hex.slice(5,7),16);
      doc.setFillColor(r,g,b);
      doc.roundedRect(x, sy, 15, 10, 2, 2, 'F');
      doc.setFontSize(5); doc.setTextColor(100,100,100);
      doc.text(hex, x, sy + 13);
    });
    y += (Math.ceil(Math.min(data.colors.colors.length,16)/8)) * 17 + 4;
    doc.setFontSize(8.5); doc.setTextColor(30,30,30);

    // ── Fonts
    section('Fonts', [34,197,94]);
    row('Detected', data.fonts.fonts.map(f=>f.name).join(', ') || 'None');

    // ── Contacts
    section('Contacts', [0,212,255]);
    row('Emails',  data.contacts.emails.join(', ') || 'None');
    row('Phones',  data.contacts.phones.join(', ') || 'None');
    row('Social',  Object.keys(data.contacts.social||{}).join(', ') || 'None');

    // ── Keywords
    section('Top Keywords', [100,112,255]);
    data.content.keywords.slice(0,12).forEach(k => row(k.word, `${k.count}x (${k.density}%)`));

    // ── Footer on every page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(245,245,250);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setFontSize(7); doc.setTextColor(120,120,140);
      doc.text('MianScan — mianhassam96.github.io/MianScan', 14, 291);
      doc.text(`Page ${i} of ${pageCount}`, 196, 291, { align: 'right' });
    }

    doc.save(`mianscan-${hostname}.pdf`);
    UI.toast('PDF exported!');
  },

  toCSV(data) {
    const hostname = data.url ? new URL(data.url).hostname : 'site';
    const rows = [['Type', 'Value', 'Count', 'Density']];

    // Keywords
    (data.content?.keywords || []).forEach(k => {
      rows.push(['keyword', k.word, k.count, k.density + '%']);
    });

    // Bigrams
    (data.content?.bigrams || []).forEach(b => {
      rows.push(['bigram', b.phrase, b.count, '']);
    });

    // Emails
    (data.contacts?.emails || []).forEach(e => {
      rows.push(['email', e, '', '']);
    });

    // Phones
    (data.contacts?.phones || []).forEach(p => {
      rows.push(['phone', p, '', '']);
    });

    // Social
    const social = data.contacts?.social || {};
    Object.entries(social).forEach(([platform, urls]) => {
      (Array.isArray(urls) ? urls : [urls]).forEach(url => {
        rows.push([`social_${platform.toLowerCase()}`, url, '', '']);
      });
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `mianscan-${hostname}-keywords.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    UI.toast('CSV exported!');
  },

  copyReport(data) {
    const lines = [
      `MianScan Report — ${data.url}`,
      `Scanned: ${new Date(data.scannedAt).toLocaleString()}`,
      '',`[Overview]`,
      `Title: ${data.overview.title}`,
      `Type: ${data.overview.type}  |  Language: ${data.overview.lang}  |  Sections: ${data.overview.sections}`,
      '',`[SEO] Score: ${data.seo.score}/100`,
      `Title: ${data.seo.title}`,
      `Description: ${data.seo.metaDesc}`,
      `H1: ${data.seo.h1s.join(' | ')||'None'}`,
      '',`[Colors] ${data.colors.total} found: ${data.colors.colors.slice(0,10).join(', ')}`,
      `[Fonts] ${data.fonts.fonts.map(f=>f.name).join(', ')||'None'}`,
      `[Tech Stack] ${data.tech.detected.join(', ')||'None'}`,
      `[Emails] ${data.contacts.emails.join(', ')||'None'}`,
      `[Phones] ${data.contacts.phones.join(', ')||'None'}`,
      `[Scripts] ${data.performance.scriptsCount}  [Images] ${data.performance.imagesCount}  [HTML] ${data.performance.htmlSizeKB}KB`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => UI.toast('Report copied!'));
  }
};
