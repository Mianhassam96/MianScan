const MobileAnalyzer = {
  analyze(doc, html) {
    const checks = [];
    let score = 0;

    // 1. Viewport meta
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const hasViewport = !!viewport;
    const hasWidthDevice = /width=device-width/i.test(viewport);
    const hasInitialScale = /initial-scale=1/i.test(viewport);
    checks.push({
      type: hasViewport && hasWidthDevice ? 'ok' : 'error',
      label: 'Viewport Meta',
      msg: hasViewport && hasWidthDevice
        ? 'Viewport meta tag correctly set'
        : hasViewport ? 'Viewport meta present but missing width=device-width'
        : 'No viewport meta tag — page not mobile-friendly',
    });
    if (hasViewport && hasWidthDevice) score += 20;
    else if (hasViewport) score += 8;

    // 2. Touch icons
    const hasTouchIcon = !!doc.querySelector('link[rel*="apple-touch-icon"]') ||
                         !!doc.querySelector('link[rel*="icon"]');
    checks.push({
      type: hasTouchIcon ? 'ok' : 'warn',
      label: 'Touch Icon',
      msg: hasTouchIcon ? 'Touch/favicon icon found' : 'No touch icon found — add apple-touch-icon',
    });
    if (hasTouchIcon) score += 10;

    // 3. Font size — check for very small font-size in inline styles
    const tinyFonts = [...doc.querySelectorAll('[style]')]
      .filter(el => /font-size\s*:\s*([0-9]+)px/i.test(el.getAttribute('style') || ''))
      .filter(el => {
        const m = el.getAttribute('style').match(/font-size\s*:\s*([0-9]+)px/i);
        return m && parseInt(m[1]) < 12;
      }).length;
    checks.push({
      type: tinyFonts > 0 ? 'warn' : 'ok',
      label: 'Font Sizes',
      msg: tinyFonts > 0
        ? `${tinyFonts} element(s) with font size < 12px (hard to read on mobile)`
        : 'No tiny inline font sizes detected',
    });
    if (tinyFonts === 0) score += 10;

    // 4. Tap targets — buttons/links with very small inline dimensions
    const smallTargets = [...doc.querySelectorAll('a,button')]
      .filter(el => {
        const s = el.getAttribute('style') || '';
        const wm = s.match(/width\s*:\s*([0-9]+)px/i);
        const hm = s.match(/height\s*:\s*([0-9]+)px/i);
        return (wm && parseInt(wm[1]) < 32) || (hm && parseInt(hm[1]) < 32);
      }).length;
    checks.push({
      type: smallTargets > 3 ? 'warn' : 'ok',
      label: 'Tap Targets',
      msg: smallTargets > 3
        ? `${smallTargets} small tap targets detected (< 32px) — hard to tap on mobile`
        : 'Tap target sizes look reasonable',
    });
    if (smallTargets <= 3) score += 10;

    // 5. Responsive images
    const imgs = [...doc.querySelectorAll('img')];
    const hasResponsiveImgs = imgs.some(i => i.getAttribute('srcset') || i.getAttribute('sizes'));
    const totalImgs = imgs.length;
    checks.push({
      type: totalImgs > 0 && !hasResponsiveImgs ? 'warn' : 'ok',
      label: 'Responsive Images',
      msg: hasResponsiveImgs
        ? 'Responsive images (srcset) detected'
        : totalImgs > 0 ? 'No srcset found — consider responsive images for mobile'
        : 'No images found',
    });
    if (hasResponsiveImgs || totalImgs === 0) score += 10;

    // 6. Media queries in inline styles or style tags
    const styleContent = [...doc.querySelectorAll('style')].map(s => s.textContent).join('');
    const hasMediaQueries = /@media/i.test(styleContent) || /@media/i.test(html);
    checks.push({
      type: hasMediaQueries ? 'ok' : 'warn',
      label: 'Media Queries',
      msg: hasMediaQueries
        ? 'CSS media queries detected — responsive design present'
        : 'No media queries found in inline styles — may not be responsive',
    });
    if (hasMediaQueries) score += 15;

    // 7. Horizontal scroll risk — fixed wide elements
    const fixedWide = [...doc.querySelectorAll('[style]')]
      .filter(el => {
        const s = el.getAttribute('style') || '';
        const wm = s.match(/width\s*:\s*([0-9]+)px/i);
        return wm && parseInt(wm[1]) > 600;
      }).length;
    checks.push({
      type: fixedWide > 2 ? 'warn' : 'ok',
      label: 'Fixed-Width Elements',
      msg: fixedWide > 2
        ? `${fixedWide} elements with fixed width > 600px — may cause horizontal scroll`
        : 'No problematic fixed-width elements detected',
    });
    if (fixedWide <= 2) score += 10;

    // 8. PWA manifest
    const hasManifest = !!doc.querySelector('link[rel="manifest"]');
    checks.push({
      type: hasManifest ? 'ok' : 'warn',
      label: 'PWA Manifest',
      msg: hasManifest ? 'Web app manifest found — PWA ready' : 'No web app manifest — consider adding for PWA support',
    });
    if (hasManifest) score += 15;

    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
    const gradeColor = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--primary2)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';

    return {
      score: Math.min(100, score),
      grade,
      gradeColor,
      hasViewport,
      hasWidthDevice,
      hasInitialScale,
      hasManifest,
      hasMediaQueries,
      hasResponsiveImgs,
      checks,
    };
  }
};
