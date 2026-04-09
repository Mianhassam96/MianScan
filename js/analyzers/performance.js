const PerformanceAnalyzer = {
    analyze(doc, html) {
        const htmlSize = new Blob([html]).size;
        const scripts = doc.querySelectorAll('script');
        const styles = doc.querySelectorAll('link[rel="stylesheet"], style');
        const images = doc.querySelectorAll('img');
        const iframes = doc.querySelectorAll('iframe');

        // Inline scripts size
        const inlineScriptSize = [...doc.querySelectorAll('script:not([src])')].reduce((acc, s) => acc + (s.textContent?.length || 0), 0);

        // Accessibility checks
        const imgsNoAlt = [...images].filter(img => !img.getAttribute('alt')).length;
        const h1Count = doc.querySelectorAll('h1').length;
        const linksNoText = [...doc.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.getAttribute('aria-label')).length;
        const inputsNoLabel = [...doc.querySelectorAll('input:not([type="hidden"])')].filter(input => {
            const id = input.id;
            return !id || !doc.querySelector(`label[for="${id}"]`);
        }).length;

        const a11yWarnings = [];
        if (imgsNoAlt > 0) a11yWarnings.push({ type: 'warn', msg: `Missing alt text on ${imgsNoAlt} image(s)` });
        if (h1Count === 0) a11yWarnings.push({ type: 'warn', msg: 'No H1 tag found' });
        if (h1Count > 1) a11yWarnings.push({ type: 'warn', msg: `Multiple H1 tags found (${h1Count})` });
        if (linksNoText > 0) a11yWarnings.push({ type: 'warn', msg: `${linksNoText} link(s) with no text` });
        if (inputsNoLabel > 0) a11yWarnings.push({ type: 'warn', msg: `${inputsNoLabel} input(s) missing labels` });
        if (a11yWarnings.length === 0) a11yWarnings.push({ type: 'ok', msg: 'No major accessibility issues found' });

        return {
            htmlSizeKB: (htmlSize / 1024).toFixed(1),
            scriptsCount: scripts.length,
            stylesCount: styles.length,
            imagesCount: images.length,
            iframesCount: iframes.length,
            inlineScriptSizeKB: (inlineScriptSize / 1024).toFixed(1),
            a11yWarnings
        };
    }
};
