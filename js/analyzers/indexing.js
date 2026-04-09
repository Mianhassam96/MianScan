const IndexingAnalyzer = {
  async analyze(doc, html, url) {
    const hostname = new URL(url).origin;

    // From meta tags
    const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const googlebot  = doc.querySelector('meta[name="googlebot"]')?.getAttribute('content') || '';
    const canonical  = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

    const noindex   = /noindex/i.test(robotsMeta) || /noindex/i.test(googlebot);
    const nofollow  = /nofollow/i.test(robotsMeta) || /nofollow/i.test(googlebot);
    const noarchive = /noarchive/i.test(robotsMeta);
    const nosnippet = /nosnippet/i.test(robotsMeta);

    // Check for robots.txt (try to fetch)
    let robotsTxt = null;
    let robotsAllows = null;
    let robotsDisallows = [];
    let sitemapUrl = null;

    try {
      const res = await fetch(Scanner.PROXIES[0](`${hostname}/robots.txt`), {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const raw = await res.text();
        let txt = raw;
        try { const j = JSON.parse(raw); if (j.contents) txt = j.contents; } catch(_) {}
        if (txt.includes('User-agent')) {
          robotsTxt = 'Found';
          robotsAllows    = (txt.match(/^Allow:\s*.+/gim) || []).length;
          robotsDisallows = (txt.match(/^Disallow:\s*.+/gim) || []).map(l => l.replace(/^Disallow:\s*/i,'').trim()).filter(Boolean).slice(0,10);
          const sm = txt.match(/Sitemap:\s*(.+)/i);
          if (sm) sitemapUrl = sm[1].trim();
        }
      }
    } catch(_) {}

    // Sitemap from HTML if not found in robots.txt
    if (!sitemapUrl) {
      const smLink = doc.querySelector('link[rel="sitemap"]');
      if (smLink) sitemapUrl = smLink.getAttribute('href');
    }

    // hreflang tags
    const hreflang = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => ({
      lang: l.getAttribute('hreflang'),
      href: l.getAttribute('href')
    })).slice(0, 10);

    // Schema.org structured data
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => {
      try { return JSON.parse(s.textContent)?.['@type'] || 'Unknown'; } catch { return null; }
    }).filter(Boolean);

    return {
      noindex, nofollow, noarchive, nosnippet,
      robotsMeta, googlebot, canonical,
      robotsTxt: robotsTxt || 'Not found',
      robotsAllows, robotsDisallows, sitemapUrl,
      hreflang, schemas,
      indexStatus: noindex ? 'Blocked' : 'Allowed'
    };
  }
};
