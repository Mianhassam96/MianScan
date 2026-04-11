const DomainAnalyzer = {
  async analyze(url) {
    const raw      = new URL(url).hostname;
    const hostname = raw.replace(/^www\./, '');

    const result = {
      hostname,
      da: null,
      daNote: null,
      rank: null,
      age: null,
      ip: null,
      country: null,
      city: null,
      isp: null,
      org: null,
      error: null,
    };

    await Promise.allSettled([

      // ── Open PageRank (free, no key needed)
      (async () => {
        try {
          const res = await fetch(
            `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (res.ok) {
            const data = await res.json();
            const entry = data?.response?.[0];
            if (entry?.page_rank_integer != null) {
              result.da     = entry.page_rank_integer;
              result.daNote = 'Open PageRank (0–10)';
            }
            if (entry?.rank) result.rank = entry.rank;
          }
        } catch (_) {}
      })(),

      // ── Domain age via RDAP
      (async () => {
        try {
          const res = await fetch(
            `https://rdap.org/domain/${hostname}`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (res.ok) {
            const data = await res.json();
            const reg = (data?.events || []).find(e => e.eventAction === 'registration');
            if (reg?.eventDate) result.age = reg.eventDate.split('T')[0];
          }
        } catch (_) {}
      })(),

      // ── IP + Geo via ip-api.com (free, CORS-friendly)
      (async () => {
        try {
          const res = await fetch(
            `https://ip-api.com/json/${hostname}?fields=status,country,city,isp,org,query`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
              result.ip      = data.query   || null;
              result.country = data.country || null;
              result.city    = data.city    || null;
              result.isp     = data.isp     || null;
              result.org     = data.org     || null;
            }
          }
        } catch (_) {}
      })(),

    ]);

    // ── Fallback DA estimation when API returns nothing
    if (result.da === null) {
      result.da     = this._estimateDA(hostname, result);
      result.daNote = 'Estimated (API unavailable)';
    }

    return result;
  },

  // Rough DA estimate based on domain signals
  _estimateDA(hostname, result) {
    // Well-known high-DA domains
    const topDomains = [
      'google.com','youtube.com','facebook.com','twitter.com','x.com',
      'instagram.com','linkedin.com','github.com','wikipedia.org','amazon.com',
      'microsoft.com','apple.com','netflix.com','reddit.com','stackoverflow.com',
      'medium.com','wordpress.com','shopify.com','stripe.com','vercel.com',
      'cloudflare.com','mozilla.org','w3.org','npmjs.com','pypi.org',
    ];
    if (topDomains.some(d => hostname.endsWith(d))) return 8;

    // TLD signals
    const tld = hostname.split('.').pop();
    let score = 2;
    if (['com','org','net','edu','gov'].includes(tld)) score += 1;
    if (result.age) {
      const years = (new Date() - new Date(result.age)) / (1000 * 60 * 60 * 24 * 365);
      if (years > 10) score += 3;
      else if (years > 5) score += 2;
      else if (years > 2) score += 1;
    }
    return Math.min(score, 6);
  }
};
