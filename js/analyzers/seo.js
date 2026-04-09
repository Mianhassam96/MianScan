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
    const h3s = [...doc.querySelectorAll('h3')].map(h=>h.textContent.trim()).slice(0,6);

    // All meta tags
    const allMeta = [...doc.querySelectorAll('meta')].map(m => ({
      name:     m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv') || '',
      content:  m.getAttribute('content') || '',
    })).filter(m => m.name && m.content).slice(0, 30);

    // All OG tags
    const ogTags = [...doc.querySelectorAll('meta[property^="og:"]')].map(m => ({
      property: m.getAttribute('property'),
      content:  m.getAttribute('content')
    }));

    // Twitter tags
    const twitterTags = [...doc.querySelectorAll('meta[name^="twitter:"]')].map(m => ({
      name:    m.getAttribute('name'),
      content: m.getAttribute('content')
    }));
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

    // Detailed warnings for SEO tab
    const warnings = [];
    if (!title)                                    warnings.push({type:'error', msg:'Missing meta title'});
    else if (title.length < 30)                    warnings.push({type:'warn',  msg:`Title too short (${title.length} chars, min 30)`});
    else if (title.length > 60)                    warnings.push({type:'warn',  msg:`Title too long (${title.length} chars, max 60)`});
    else                                           warnings.push({type:'ok',    msg:`Title length good (${title.length} chars)`});

    if (!metaDesc)                                 warnings.push({type:'error', msg:'Missing meta description'});
    else if (metaDesc.length < 100)                warnings.push({type:'warn',  msg:`Description too short (${metaDesc.length} chars, min 100)`});
    else if (metaDesc.length > 160)                warnings.push({type:'warn',  msg:`Description too long (${metaDesc.length} chars, max 160)`});
    else                                           warnings.push({type:'ok',    msg:`Description length good (${metaDesc.length} chars)`});

    if (h1s.length === 0)                          warnings.push({type:'error', msg:'No H1 tag found'});
    else if (h1s.length > 1)                       warnings.push({type:'warn',  msg:`Multiple H1 tags found (${h1s.length}) — should be 1`});
    else                                           warnings.push({type:'ok',    msg:'Single H1 tag — correct'});

    if (noAlt > 0)                                 warnings.push({type:'warn',  msg:`${noAlt} image(s) missing alt text`});
    else if (imgs.length > 0)                      warnings.push({type:'ok',    msg:'All images have alt text'});

    if (!canonical)                                warnings.push({type:'warn',  msg:'No canonical URL set'});
    else                                           warnings.push({type:'ok',    msg:'Canonical URL present'});

    if (!ogTitle)                                  warnings.push({type:'warn',  msg:'Missing OG title (social sharing)'});
    else                                           warnings.push({type:'ok',    msg:'OG title present'});

    if (!viewport)                                 warnings.push({type:'error', msg:'Missing viewport meta (not mobile-friendly)'});
    else                                           warnings.push({type:'ok',    msg:'Viewport meta present'});

    return { score: Math.min(score,100), title, metaDesc, metaKw, canonical, ogTitle, ogImage, twCard, viewport, h1s, h2s, h3s, imagesTotal: imgs.length, withAlt, noAlt, warnings, allMeta, ogTags, twitterTags };
  }
};
