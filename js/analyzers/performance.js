const PerformanceAnalyzer = {
  analyze(doc, html) {
    const htmlSizeKB  = (new Blob([html]).size / 1024).toFixed(1);
    const scripts     = doc.querySelectorAll('script');
    const styles      = doc.querySelectorAll('link[rel="stylesheet"],style');
    const images      = doc.querySelectorAll('img');
    const iframes     = doc.querySelectorAll('iframe');
    const inlineKB    = ([...doc.querySelectorAll('script:not([src])')].reduce((a,s)=>a+(s.textContent?.length||0),0)/1024).toFixed(1);
    const noAlt       = [...images].filter(i=>!i.getAttribute('alt')).length;
    const h1Count     = doc.querySelectorAll('h1').length;
    const noLabel     = [...doc.querySelectorAll('input:not([type="hidden"])')].filter(inp=>!inp.id||!doc.querySelector(`label[for="${inp.id}"]`)).length;
    const emptyLinks  = [...doc.querySelectorAll('a')].filter(a=>!a.textContent.trim()&&!a.getAttribute('aria-label')).length;
    const lazyImgs    = [...images].filter(i=>i.getAttribute('loading')==='lazy').length;
    const extScripts  = [...doc.querySelectorAll('script[src]')].filter(s=>s.src&&s.src.startsWith('http')).length;

    // ── Performance score (0–100)
    let score = 100;
    const checks = [];

    // HTML size
    const sizeKB = parseFloat(htmlSizeKB);
    if (sizeKB > 500) {
      score -= 20;
      checks.push({ type:'warn', msg:`HTML size is large (${htmlSizeKB} KB) — aim for < 200 KB` });
    } else if (sizeKB > 200) {
      score -= 8;
      checks.push({ type:'warn', msg:`HTML size is moderate (${htmlSizeKB} KB)` });
    } else {
      checks.push({ type:'ok', msg:`HTML size is good (${htmlSizeKB} KB)` });
    }

    // Scripts count
    if (scripts.length > 20) {
      score -= 15;
      checks.push({ type:'warn', msg:`High script count (${scripts.length}) — reduces load speed` });
    } else if (scripts.length > 10) {
      score -= 5;
      checks.push({ type:'warn', msg:`Moderate script count (${scripts.length})` });
    } else {
      checks.push({ type:'ok', msg:`Script count is fine (${scripts.length})` });
    }

    // Inline JS
    const inlineKBf = parseFloat(inlineKB);
    if (inlineKBf > 50) {
      score -= 10;
      checks.push({ type:'warn', msg:`Large inline JS (${inlineKB} KB) — consider externalizing` });
    } else {
      checks.push({ type:'ok', msg:`Inline JS size is fine (${inlineKB} KB)` });
    }

    // Iframes
    if (iframes.length > 3) {
      score -= 10;
      checks.push({ type:'warn', msg:`${iframes.length} iframes — each adds a separate HTTP request` });
    } else if (iframes.length > 0) {
      checks.push({ type:'ok', msg:`${iframes.length} iframe(s) found` });
    } else {
      checks.push({ type:'ok', msg:'No iframes found' });
    }

    // Lazy loading
    if (images.length > 3 && lazyImgs === 0) {
      score -= 10;
      checks.push({ type:'warn', msg:`No lazy-loaded images — add loading="lazy" to improve speed` });
    } else if (lazyImgs > 0) {
      checks.push({ type:'ok', msg:`${lazyImgs} image(s) use lazy loading` });
    }

    // External scripts
    if (extScripts > 15) {
      score -= 10;
      checks.push({ type:'warn', msg:`${extScripts} external scripts — increases dependency risk` });
    } else {
      checks.push({ type:'ok', msg:`${extScripts} external script(s)` });
    }

    // Stylesheets
    if (styles.length > 8) {
      score -= 5;
      checks.push({ type:'warn', msg:`${styles.length} stylesheets — consider bundling` });
    } else {
      checks.push({ type:'ok', msg:`${styles.length} stylesheet(s)` });
    }

    score = Math.max(0, Math.min(100, score));
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

    // Accessibility checks
    const a11y = [];
    if (noAlt > 0)      a11y.push({ type:'warn', msg:`Missing alt text on ${noAlt} image(s)` });
    else                a11y.push({ type:'ok',   msg:'All images have alt text' });
    if (h1Count === 0)  a11y.push({ type:'error',msg:'No H1 tag found on page' });
    else if (h1Count>1) a11y.push({ type:'warn', msg:`Multiple H1 tags (${h1Count}) — should be 1` });
    else                a11y.push({ type:'ok',   msg:'Single H1 tag — correct' });
    if (noLabel > 0)    a11y.push({ type:'warn', msg:`${noLabel} input(s) missing labels` });
    else                a11y.push({ type:'ok',   msg:'All inputs appear to have labels' });
    if (emptyLinks > 0) a11y.push({ type:'warn', msg:`${emptyLinks} link(s) with no text` });
    else                a11y.push({ type:'ok',   msg:'All links have text' });

    return {
      htmlSizeKB,
      scriptsCount: scripts.length,
      stylesCount: styles.length,
      imagesCount: images.length,
      iframesCount: iframes.length,
      inlineKB,
      lazyImgs,
      extScripts,
      score,
      grade,
      checks,
      a11y
    };
  }
};
