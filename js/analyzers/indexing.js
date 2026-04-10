const IndexingAnalyzer = {
  async analyze(doc, html, url) {
    const origin  = new URL(url).origin;
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    // ── From meta tags (instant, no network)
    const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
    const googlebot  = doc.querySelector('meta[name="googlebot"]')?.getAttribute('content') || '';
    const canonical  = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

    const noindex   = /noindex/i.test(robotsMeta)  || /noindex/i.test(googlebot);
    const nofollow  = /nofollow/i.test(robotsMeta) || /nofollow/i.test(googlebot);
    const noarchive = /noarchive/i.test(robotsMeta);
    const nosnippet = /nosnippet/i.test(robotsMeta);

    // ── Sitemap from HTML link tag (instant)
    let sitemapUrl = doc.querySelector('link[rel="sitemap"]')?.getAttribute('href') || null;

    // ── hreflang tags (instant)
    const hreflang = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')]
      .map(l => ({ lang: l.getAttribute('hreflang'), href: l.getAttribute('href') }))
      .slice(0, 10);

    // ── Schema.org (instant)
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')]
      .map(s => { try { return JSON.parse(s.textContent)?.['@type'] || null; } catch { return null; } })
      .filter(Boolean);

    // ── robots.txt (network — use corsproxy.io)
    let robotsTxt = 'Not found';
    let robotsDisallows = [];
    let robotsAllows = 0;

    try {
      const robotsUrl = `${origin}/robots.txt`;
      const proxyUrl  = `https://corsproxy.io/?${encodeURIComponent(robotsUrl)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        let txt = await res.text();
        // corsproxy returns raw text; allorigins returns JSON
        try { const j = JSON.parse(txt); if (j.contents) txt = j.contents; } catch (_) {}
        if (txt && (txt.includes('User-agent') || txt.includes('Disallow'))) {
          robotsTxt       = 'Found';
          robotsAllows    = (txt.match(/^Allow:\s*.+/gim) || []).length;
          robotsDisallows = (txt.match(/^Disallow:\s*.+/gim) || [])
            .map(l => l.replace(/^Disallow:\s*/i, '').trim())
            .filter(Boolean)
            .slice(0, 12);
          // Extract sitemap from robots.txt if not found in HTML
          if (!sitemapUrl) {
            const sm = txt.match(/^Sitemap:\s*(.+)/im);
            if (sm) sitemapUrl = sm[1].trim();
          }
        }
      }
    } catch (_) {}

    return {
      noindex, nofollow, noarchive, nosnippet,
      robotsMeta, googlebot, canonical,
      robotsTxt,
      robotsAllows,
      robotsDisallows,
      sitemapUrl,
      hreflang,
      schemas,
      indexStatus: noindex ? 'Blocked' : 'Allowed'
    };
  }
};
