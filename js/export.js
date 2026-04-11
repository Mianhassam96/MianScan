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
    const doc = new jsPDF(); let y = 20;
    const hostname = new URL(data.url).hostname;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkY = (needed = 10) => { if (y + needed > 275) addPage(); };

    const section = (title, color) => {
      checkY(14);
      y += 3;
      doc.setFillColor(...(color || [100, 112, 255]));
      doc.rect(20, y - 4, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text(title, 23, y + 1);
      doc.setTextColor(15, 23, 42);
      y += 10; doc.setFontSize(9);
    };

    const row = (label, val) => {
      checkY(7);
      doc.setFont(undefined, 'bold'); doc.setTextColor(90, 106, 133);
      doc.text(label + ':', 22, y);
      doc.setFont(undefined, 'normal'); doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(String(val || '—'), 125);
      doc.text(lines, 72, y);
      y += lines.length * 5 + 2;
    };

    const check = (label, pass) => {
      checkY(6);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(pass ? 34 : 240, pass ? 197 : 68, pass ? 94 : 68);
      doc.text(pass ? '✓' : '✗', 22, y);
      doc.setTextColor(15, 23, 42);
      doc.text(label, 30, y);
      y += 6;
    };

    // Header
    doc.setFillColor(100, 112, 255);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text('MianScan Report', 20, 12);
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text(hostname, 120, 12);
    doc.setTextColor(15, 23, 42);
    y = 26;

    doc.setFontSize(8); doc.setTextColor(90, 106, 133);
    doc.text('Scanned: ' + new Date(data.scannedAt).toLocaleString(), 20, y);
    doc.text(data.url, 20, y + 5);
    doc.setTextColor(15, 23, 42);
    y += 14;

    section('Overview');
    row('Title',    data.overview.title);
    row('Type',     data.overview.type);
    row('Language', data.overview.lang);
    row('Sections', data.overview.sections);
    row('Words',    (data.content.wordCount || 0).toLocaleString());
    row('HTML Size', data.performance.htmlSizeKB + ' KB');

    section('SEO Analysis', [34, 197, 94]);
    row('Score',       data.seo.score + '/100');
    row('Title',       data.seo.title || '—');
    row('Description', data.seo.metaDesc || '—');
    row('H1 Tags',     data.seo.h1s.join(', ') || 'None');
    row('H2 Tags',     (data.seo.h2s || []).length + ' found');
    row('Canonical',   data.seo.canonical || 'Not set');
    y += 2;
    check('Meta Title',       !!data.seo.title);
    check('Meta Description', !!data.seo.metaDesc);
    check('Single H1',        data.seo.h1s.length === 1);
    check('OG Tags',          !!data.seo.ogTitle);
    check('All Images Alt',   data.seo.noAlt === 0);

    section('Domain & Ranking', [168, 85, 247]);
    const da = data.domain?.da != null ? data.domain.da + '/10' : 'N/A';
    const rank = data.ranking?.globalRank ? '#' + Number(data.ranking.globalRank).toLocaleString() : 'N/A';
    row('Domain',       data.domain?.hostname || hostname);
    row('Domain Auth',  da);
    row('Global Rank',  rank);
    row('PageRank',     data.ranking?.pageRank != null ? data.ranking.pageRank + '/10' : 'N/A');

    section('Tech Stack', [0, 212, 255]);
    row('Detected', data.tech.detected.join(', ') || 'None');
    row('Scripts',  data.performance.scriptsCount);
    row('Styles',   data.performance.stylesCount);

    section('Colors', [236, 72, 153]);
    row('Total Found', data.colors.total);
    row('Palette', data.colors.colors.slice(0, 12).join('  '));
    // Draw color swatches
    checkY(20);
    y += 2;
    data.colors.colors.slice(0, 16).forEach((hex, i) => {
      const x = 22 + (i % 8) * 20;
      const sy = y + Math.floor(i / 8) * 14;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(x, sy, 14, 10, 2, 2, 'F');
      doc.setFontSize(5); doc.setTextColor(90, 106, 133);
      doc.text(hex, x, sy + 13);
    });
    y += (Math.ceil(Math.min(data.colors.colors.length, 16) / 8)) * 16 + 4;
    doc.setFontSize(9); doc.setTextColor(15, 23, 42);

    section('Fonts', [34, 197, 94]);
    row('Detected', data.fonts.fonts.map(f => f.name).join(', ') || 'None');

    section('Contacts', [0, 212, 255]);
    row('Emails', data.contacts.emails.join(', ') || 'None');
    row('Phones', data.contacts.phones.join(', ') || 'None');
    const socials = Object.keys(data.contacts.social || {}).join(', ');
    row('Social', socials || 'None');

    section('Performance', [245, 158, 11]);
    row('HTML Size',   data.performance.htmlSizeKB + ' KB');
    row('Scripts',     data.performance.scriptsCount);
    row('Images',      data.performance.imagesCount);
    row('Stylesheets', data.performance.stylesCount);
    row('Iframes',     data.performance.iframesCount);

    section('Keywords (Top 15)', [100, 112, 255]);
    data.content.keywords.slice(0, 15).forEach(k => row(k.word, k.count + 'x  (' + k.density + '%)'));

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(90, 106, 133);
      doc.text('MianScan — mianhassam96.github.io/MianScan', 20, 290);
      doc.text('Page ' + i + ' of ' + pageCount, 185, 290);
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
