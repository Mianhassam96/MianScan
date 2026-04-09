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
    const add = (label, val) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont(undefined,'bold'); doc.text(label+':', 20, y);
      doc.setFont(undefined,'normal');
      const lines = doc.splitTextToSize(String(val||'—'), 130);
      doc.text(lines, 72, y); y += lines.length*5+3;
    };
    const section = title => {
      if (y > 260) { doc.addPage(); y = 20; }
      y += 4; doc.setFontSize(13); doc.setFont(undefined,'bold'); doc.text(title, 20, y); y += 7; doc.setFontSize(10);
    };
    doc.setFontSize(20); doc.setFont(undefined,'bold'); doc.text('MianScan Report', 20, y); y += 8;
    doc.setFontSize(10); doc.setFont(undefined,'normal');
    doc.text(data.url, 20, y); y += 5;
    doc.text('Scanned: '+new Date(data.scannedAt).toLocaleString(), 20, y); y += 10;
    section('Overview');
    add('Title',    data.overview.title);
    add('Type',     data.overview.type);
    add('Language', data.overview.lang);
    add('Sections', data.overview.sections);
    section('SEO');
    add('Score',       data.seo.score+'/100');
    add('Title',       data.seo.title);
    add('Description', data.seo.metaDesc);
    add('H1',          data.seo.h1s.join(', ')||'None');
    section('Colors');
    add('Found',   data.colors.total);
    add('Palette', data.colors.colors.slice(0,10).join('  '));
    section('Tech Stack');
    add('Detected', data.tech.detected.join(', ')||'None');
    section('Contacts');
    add('Emails', data.contacts.emails.join(', ')||'None');
    add('Phones', data.contacts.phones.join(', ')||'None');
    section('Performance');
    add('HTML Size', data.performance.htmlSizeKB+' KB');
    add('Scripts',   data.performance.scriptsCount);
    add('Images',    data.performance.imagesCount);
    doc.save(`mianscan-${new URL(data.url).hostname}.pdf`);
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
