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
    const a11y = [];
    if (noAlt>0)        a11y.push({ok:false, msg:`Missing alt text on ${noAlt} image(s)`});
    if (h1Count===0)    a11y.push({ok:false, msg:'No H1 tag found on page'});
    if (h1Count>1)      a11y.push({ok:false, msg:`Multiple H1 tags (${h1Count}) — should be 1`});
    if (noLabel>0)      a11y.push({ok:false, msg:`${noLabel} input(s) missing labels`});
    if (emptyLinks>0)   a11y.push({ok:false, msg:`${emptyLinks} link(s) with no text`});
    if (!a11y.length)   a11y.push({ok:true,  msg:'No major accessibility issues found'});
    return { htmlSizeKB, scriptsCount: scripts.length, stylesCount: styles.length, imagesCount: images.length, iframesCount: iframes.length, inlineKB, a11y };
  }
};
