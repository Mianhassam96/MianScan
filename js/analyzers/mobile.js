const MobileAnalyzer = {
  analyze(doc, html = '') {
    const checks = [];
    let score = 0;
    const fullHtml = html || doc.documentElement.innerHTML;

    // 1. Viewport meta — 25 pts
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const hasViewport      = !!viewport;
    const hasWidthDevice   = /width=device-width/i.test(viewport);
    const hasInitialScale  = /initial-scale=1/i.test(viewport);
    const viewportOk = hasViewport && hasWidthDevice;
    checks.push({
      type: viewportOk ? 'ok' : 'error',
      label: 'Viewport Meta',
      msg: viewportOk
        ? `Viewport correctly set (${viewport})`
        : hasViewport
          ? 'Viewport present but missing width=device-width'
          : 'No viewport meta tag — page will not scale on mobile',
    });
    if (viewportOk) score += 25;
    else if (hasViewport) score += 8;

    // 2. Responsive images — 15 pts
    const imgs = [...doc.querySelectorAll('img')];
    const hasResponsiveImgs = imgs.some(i => i.getAttribute('srcset') || i.getAttribute('sizes'));
    const totalImgs = imgs.length;
    checks.push({
      type: totalImgs > 0 && !hasResponsiveImgs ? 'warn' : 'ok',
      label: 'Responsive Images',
      msg: hasResponsiveImgs
        ? 'Responsive images (srcset/sizes) detected'
        : totalImgs > 0
          ? 'No srcset found — add responsive images for better mobile performance'
          : 'No images found',
    });
    if (hasResponsiveImgs || totalImgs === 0) score += 15;

    // 3. CSS Media queries — 20 pts (check both inline styles and external refs)
    const styleContent = [...doc.querySelectorAll('style')].map(s => s.textContent).join('');
    const hasMediaQueries = /@media\s*[\(\(]/i.test(styleContent) || /@media\s*[\(\(]/i.test(fullHtml);
    // Also check for responsive framework classes (Bootstrap, Tailwind)
    const hasResponsiveClasses = /\b(col-sm|col-md|col-lg|sm:|md:|lg:|flex-col|grid-cols)\b/.test(fullHtml);
    const responsiveOk = hasMediaQueries || hasResponsiveClasses;
    checks.push({
      type: responsiveOk ? 'ok' : 'warn',
      label: 'Responsive Design',
      msg: hasMediaQueries
        ? 'CSS media queries detected — responsive layout present'
        : hasResponsiveClasses
          ? 'Responsive framework classes detected (Bootstrap/Tailwind)'
          : 'No media queries or responsive classes found — may not be mobile-friendly',
    });
    if (responsiveOk) score += 20;

    // 4. Touch icon — 5 pts
    const hasTouchIcon = !!doc.querySelector('link[rel*="apple-touch-icon"]') ||
                         !!doc.querySelector('link[rel*="icon"]');
    checks.push({
      type: hasTouchIcon ? 'ok' : 'warn',
      label: 'Touch / Favicon Icon',
      msg: hasTouchIcon ? 'Touch icon / favicon found' : 'No touch icon — add apple-touch-icon for iOS',
    });
    if (hasTouchIcon) score += 5;

    // 5. Lazy loading images — 10 pts
    const lazyImgs = imgs.filter(i => i.getAttribute('loading') === 'lazy').length;
    const lazyOk = totalImgs === 0 || lazyImgs > 0;
    checks.push({
      type: lazyOk ? 'ok' : 'warn',
      label: 'Lazy Loading',
      msg: lazyImgs > 0
        ? `${lazyImgs} of ${totalImgs} image(s) use lazy loading`
        : totalImgs > 0
          ? `No lazy loading — add loading="lazy" to images below the fold`
          : 'No images found',
    });
    if (lazyOk) score += 10;

    // 6. PWA Manifest — 10 pts
    const hasManifest = !!doc.querySelector('link[rel="manifest"]');
    checks.push({
      type: hasManifest ? 'ok' : 'warn',
      label: 'PWA Manifest',
      msg: hasManifest
        ? 'Web app manifest found — PWA-ready'
        : 'No web app manifest — add for PWA / installable app support',
    });
    if (hasManifest) score += 10;

    // 7. No horizontal overflow risk — 10 pts
    // Check for fixed pixel widths wider than typical mobile (>768px) in inline styles
    const fixedWideCount = (fullHtml.match(/width\s*:\s*([89]\d{2}|[1-9]\d{3,})px/gi) || []).length;
    const overflowOk = fixedWideCount <= 3;
    checks.push({
      type: overflowOk ? 'ok' : 'warn',
      label: 'Fixed-Width Elements',
      msg: overflowOk
        ? 'No problematic fixed-width elements detected'
        : `${fixedWideCount} elements with fixed width > 800px — may cause horizontal scroll on mobile`,
    });
    if (overflowOk) score += 10;

    // 8. Font size readability — 5 pts
    const tinyFontCount = (fullHtml.match(/font-size\s*:\s*([1-9]|10|11)px/gi) || []).length;
    const fontOk = tinyFontCount === 0;
    checks.push({
      type: fontOk ? 'ok' : 'warn',
      label: 'Font Sizes',
      msg: fontOk
        ? 'No tiny font sizes detected'
        : `${tinyFontCount} instance(s) of font-size < 12px — hard to read on mobile`,
    });
    if (fontOk) score += 5;

    score = Math.max(0, Math.min(100, score));
    const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

    return {
      score,
      grade,
      hasViewport,
      hasWidthDevice,
      hasInitialScale,
      hasManifest,
      hasMediaQueries: responsiveOk,
      hasResponsiveImgs,
      lazyImgs,
      checks,
    };
  }
};
