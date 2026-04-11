const DomainAnalyzer = {
  async analyze(url) {
    const raw = new URL(url).hostname;
    const hostname = raw.replace(/^www\./, '');

    const result = {
      hostname,
      da: null,
      rank: null,
      age: null,
      ip: null,
      country: null,
      city: null,
      isp: null,
      org: null,
      error: null,
      daNote: 'Estimated from on-page signals'
    };

    // Run all lookups in parallel
    await Promise.allSettled([

      // Open PageRank
      (async () => {
        const res = await fetch(
          `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          const entry = data?.response?.[0];
          if (entry) {
            if (entry.page_rank_integer != null) { result.da = entry.page_rank_integer; result.daNote = 'Open PageRank (0–10)'; }
            if (entry.rank) result.rank = entry.rank;
          }
        }
      })(),

      // Domain age via RDAP
      (async () => {
        const res = await fetch(`https://rdap.org/domain/${hostname}`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const reg = (data?.events || []).find(e => e.eventAction === 'registration');
          if (reg?.eventDate) result.age = reg.eventDate.split('T')[0];
        }
      })(),

      // IP + geo + ISP via ip-api.com (free, no key, CORS-friendly)
      (async () => {
        const res = await fetch(
          `https://ip-api.com/json/${hostname}?fields=status,country,city,isp,org,query`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            result.ip      = data.query  || null;
            result.country = data.country || null;
            result.city    = data.city    || null;
            result.isp     = data.isp     || null;
            result.org     = data.org     || null;
          }
        }
      })(),

    ]);

    return result;
  }
};
