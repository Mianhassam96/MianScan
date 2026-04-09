const Exporter = {
    toJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `mianscan-${new URL(data.url).hostname}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        UI.toast('JSON exported!');
    },

    toPDF(data) {
        if (typeof window.jspdf === 'undefined') { UI.toast('PDF library not loaded'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        const line = (label, val, indent = false) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text((indent ? '  ' : '') + label + ':', 20, y);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(String(val), 130);
            doc.text(lines, 70, y);
            y += lines.length * 5 + 3;
        };

        doc.setFontSize(20); doc.setFont(undefined, 'bold');
        doc.text('MianScan Report', 20, y); y += 8;
        doc.setFontSize(10); doc.setFont(undefined, 'normal');
        doc.text(data.url, 20, y); y += 5;
        doc.text('Scanned: ' + new Date(data.scannedAt).toLocaleString(), 20, y); y += 10;

        doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Overview', 20, y); y += 7;
        doc.setFontSize(10);
        line('Title',    data.overview.title);
        line('Type',     data.overview.type);
        line('Language', data.overview.lang);
        line('Sections', data.overview.sections);

        y += 4; doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('SEO', 20, y); y += 7;
        doc.setFontSize(10);
        line('Score',       data.seo.score + '/100');
        line('Title',       data.seo.title);
        line('Description', data.seo.metaDesc);
        line('H1 Tags',     data.seo.h1s.join(', ') || 'None');

        y += 4; doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Colors', 20, y); y += 7;
        doc.setFontSize(10);
        line('Found', data.colors.total);
        line('Palette', data.colors.colors.slice(0,10).join('  '));

        y += 4; doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Tech Stack', 20, y); y += 7;
        doc.setFontSize(10);
        line('Detected', data.tech.detected.join(', ') || 'None');

        y += 4; doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Contacts', 20, y); y += 7;
        doc.setFontSize(10);
        line('Emails', data.contacts.emails.join(', ') || 'None');
        line('Phones', data.contacts.phones.join(', ') || 'None');

        y += 4; doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Performance', 20, y); y += 7;
        doc.setFontSize(10);
        line('HTML Size',  data.performance.htmlSizeKB + ' KB');
        line('Scripts',    data.performance.scriptsCount);
        line('Images',     data.performance.imagesCount);

        doc.save(`mianscan-${new URL(data.url).hostname}.pdf`);
        UI.toast('PDF exported!');
    },

    copyReport(data) {
        const txt = [
            `MianScan Report — ${data.url}`,
            `Scanned: ${new Date(data.scannedAt).toLocaleString()}`,
            '',
            `[Overview]`,
            `Title: ${data.overview.title}`,
            `Type: ${data.overview.type}  Language: ${data.overview.lang}  Sections: ${data.overview.sections}`,
            '',
            `[SEO] Score: ${data.seo.score}/100`,
            `Title: ${data.seo.title}`,
            `Description: ${data.seo.metaDesc}`,
            `H1: ${data.seo.h1s.join(' | ')}`,
            '',
            `[Colors] ${data.colors.total} found: ${data.colors.colors.slice(0,10).join(', ')}`,
            `[Fonts] ${data.fonts.fonts.map(f=>f.name).join(', ')}`,
            `[Tech Stack] ${data.tech.detected.join(', ')}`,
            `[Emails] ${data.contacts.emails.join(', ')}`,
            `[Phones] ${data.contacts.phones.join(', ')}`,
            `[Scripts] ${data.performance.scriptsCount}  [Images] ${data.performance.imagesCount}  [HTML] ${data.performance.htmlSizeKB}KB`,
        ].join('\n');
        navigator.clipboard.writeText(txt).then(() => UI.toast('Report copied!'));
    }
};
