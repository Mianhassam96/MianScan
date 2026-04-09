const SEOAnalyzer = {
  analyze(doc) {
    const g = (sel,attr) => doc.querySelector(sel)?.getAttribute(attr)?.trim()||'';
    const t = sel => doc.querySelector(sel)?.textContent?.trim()||'';
    const title     = t('title');
    const metaDesc  = g('meta[name="description"]','content');
    const metaKw    = g('meta[name="keywords"]','content');
    const canonical = g('link[rel="canonical"]','href');
    const ogTitle   = g('meta[property="og:title"]','content');
    const ogImage   = g('meta[property="og:image"]','content');
    const twCard    = g('meta[name="twitter:card"]','content');
    const viewport  = g('meta[name="viewport"]','content');
    const h1s = [...doc.querySelectorAll('h1')].map(h=>h.textContent.trim());
    const h2s = [...doc.querySelectorAll('h2')].map(h=>h.textContent.trim()).slice(0,6);
    const imgs = doc.querySelectorAll('img');
    const withAlt = [...imgs].filter(i=>i.getAttribute('alt')).length;
    const noAlt = imgs.length - withAlt;
    let score = 0;
    if (title)                                     score += 15;
    if (title.length>=30 && title.length<=60)      score += 5;
    if (metaDesc)                                  score += 15;
    if (metaDesc.length>=100&&metaDesc.length<=160)score += 5;
    if (h1s.length===1)                            score += 10;
    if (h2s.length>0)                              score += 5;
    if (canonical)                                 score += 5;
    if (ogTitle)                                   score += 5;
    if (ogImage)                                   score += 5;
    if (twCard)                                    score += 5;
    if (viewport)                                  score += 5;
    if (noAlt===0 && imgs.length>0)                score += 10;
    else if (noAlt<3)                              score += 5;
    if (metaKw)                                    score += 5;
    return { score: Math.min(score,100), title, metaDesc, metaKw, canonical, ogTitle, ogImage, twCard, viewport, h1s, h2s, imagesTotal: imgs.length, withAlt, noAlt };
  }
};
