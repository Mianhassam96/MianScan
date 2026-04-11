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
    // ── Weighted SEO score engine (100 pts total)
    let score = 0;
    const checks = [];

    // ── Meta Title — 20 pts
    if (title) {
      score += 10;
      checks.push({ id:'title', type:'ok', category:'Meta', msg:`Title present (${title.length} chars)` });
      if (title.length >= 30 && title.length <= 60) {
        score += 10;
        checks.push({ id:'title_len', type:'ok', category:'Meta', msg:'Title length optimal (30–60 chars)' });
      } else if (title.length < 30) {
        score += 3;
        checks.push({ id:'title_len', type:'warn', category:'Meta', msg:`Title too short (${title.length} chars, min 30)` });
      } else {
        score += 3;
        checks.push({ id:'title_len', type:'warn', category:'Meta', msg:`Title too long (${title.length} chars, max 60)` });
      }
    } else {
      checks.push({ id:'title', type:'error', category:'Meta', msg:'Missing meta title — critical SEO issue' });
    }

    // ── Meta Description — 15 pts
    if (metaDesc) {
      score += 8;
      checks.push({ id:'desc', type:'ok', category:'Meta', msg:`Meta description present (${metaDesc.length} chars)` });
      if (metaDesc.length >= 100 && metaDesc.length <= 160) {
        score += 7;
        checks.push({ id:'desc_len', type:'ok', category:'Meta', msg:'Description length optimal (100–160 chars)' });
      } else if (metaDesc.length < 100) {
        score += 2;
        checks.push({ id:'desc_len', type:'warn', category:'Meta', msg:`Description too short (${metaDesc.length} chars, min 100)` });
      } else {
        score += 2;
        checks.push({ id:'desc_len', type:'warn', category:'Meta', msg:`Description too long (${metaDesc.length} chars, max 160)` });
      }
    } else {
      checks.push({ id:'desc', type:'error', category:'Meta', msg:'Missing meta description' });
    }

    // ── Headings — 20 pts
    if (h1s.length === 1) {
      score += 12;
      checks.push({ id:'h1', type:'ok', category:'Content', msg:'Single H1 tag — correct' });
    } else if (h1s.length === 0) {
      checks.push({ id:'h1', type:'error', category:'Content', msg:'No H1 tag found — critical SEO issue' });
    } else {
      score += 4;
      checks.push({ id:'h1', type:'warn', category:'Content', msg:`Multiple H1 tags (${h1s.length}) — should be exactly 1` });
    }
    if (h2s.length > 0) {
      score += 5;
      checks.push({ id:'h2', type:'ok', category:'Content', msg:`H2 tags present (${h2s.length})` });
    } else {
      checks.push({ id:'h2', type:'warn', category:'Content', msg:'No H2 tags — add subheadings for structure' });
    }
    if (h3s.length > 0) {
      score += 3;
      checks.push({ id:'h3', type:'ok', category:'Content', msg:`H3 tags present (${h3s.length})` });
    }

    // ── Images Alt Text — 10 pts
    if (imgs.length > 0) {
      if (noAlt === 0) {
        score += 10;
        checks.push({ id:'alt', type:'ok', category:'Images', msg:'All images have alt text' });
      } else if (noAlt <= 2) {
        score += 5;
        checks.push({ id:'alt', type:'warn', category:'Images', msg:`${noAlt} image(s) missing alt text` });
      } else {
        score += 2;
        checks.push({ id:'alt', type:'error', category:'Images', msg:`${noAlt} images missing alt text — hurts SEO` });
      }
    }

    // ── Technical — 15 pts
    if (canonical) {
      score += 7;
      checks.push({ id:'canonical', type:'ok', category:'Technical', msg:'Canonical URL present' });
    } else {
      checks.push({ id:'canonical', type:'warn', category:'Technical', msg:'No canonical URL — duplicate content risk' });
    }
    if (viewport) {
      score += 8;
      checks.push({ id:'viewport', type:'ok', category:'Technical', msg:'Viewport meta present — mobile-friendly' });
    } else {
      checks.push({ id:'viewport', type:'error', category:'Technical', msg:'Missing viewport meta — not mobile-friendly' });
    }

    // ── Social / OG — 10 pts
    if (ogTitle) {
      score += 4;
      checks.push({ id:'og_title', type:'ok', category:'Social', msg:'OG title present' });
    } else {
      checks.push({ id:'og_title', type:'warn', category:'Social', msg:'Missing OG title — affects social sharing' });
    }
    if (ogImage) {
      score += 3;
      checks.push({ id:'og_image', type:'ok', category:'Social', msg:'OG image present' });
    } else {
      checks.push({ id:'og_image', type:'warn', category:'Social', msg:'Missing OG image — affects social sharing' });
    }
    if (twCard) {
      score += 3;
      checks.push({ id:'tw_card', type:'ok', category:'Social', msg:'Twitter card meta present' });
    } else {
      checks.push({ id:'tw_card', type:'warn', category:'Social', msg:'Missing Twitter card meta' });
    }

    // ── Keywords — 5 pts
    if (metaKw) {
      score += 5;
      checks.push({ id:'keywords', type:'ok', category:'Meta', msg:'Meta keywords present' });
    } else {
      checks.push({ id:'keywords', type:'warn', category:'Meta', msg:'No meta keywords (minor)' });
    }

    // Build legacy warnings array for backward compat
    const warnings = checks.map(c => ({ type: c.type, msg: c.msg }));

    // Categorized summary counts
    const passed   = checks.filter(c => c.type === 'ok').length;
    const warnings_count = checks.filter(c => c.type === 'warn').length;
    const errors   = checks.filter(c => c.type === 'error').length;

    return {
      score: Math.min(score, 100),
      title, metaDesc, metaKw, canonical, ogTitle, ogImage, twCard, viewport,
      h1s, h2s, h3s,
      imagesTotal: imgs.length, withAlt, noAlt,
      warnings,   // legacy compat
      checks,     // new detailed checks with categories
      passed, warnings_count, errors,
      allMeta, ogTags, twitterTags
    };
  }
};
