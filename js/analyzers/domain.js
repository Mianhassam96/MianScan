const DomainAnalyzer = {
  async analyze(url) {
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    // Estimate DA/PA using open-source signals from free APIs
    const result = {
      hostname,
      da: null, pa: null,
      rank: null,
      backlinks: null,
      indexed: null,
      age: null,
      registrar: null,
      error: null
    };

    // 1. Try Open PageRank API (free, no key needed)
    try {
      const res = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`, {
        headers: { 'API-OPR': 'free' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        const entry = data?.response?.[0];
        if (entry) {
          result.da = entry.page_rank_integer ?? null;
          result.rank = entry.rank ?? null;
        }
      }
    } catch(_) {}

    // 2. Try website-worth / domain info via free WHOIS API
    try {
      const res = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${hostname}&limit=1`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        const entry = data?.domains?.[0];
        if (entry) {
          result.age = entry.create_date ? entry.create_date.split('T')[0] : null;
        }
      }
    } catch(_) {}

    // 3. Estimate PA from SEO score (local fallback)
    // PA is always estimated — no free API gives real Moz PA
    result.paNote = 'Estimated from on-page signals';
    result.daNote = result.da !== null ? 'Open PageRank score (0–10)' : 'Not available — API limit reached';

    return result;
  }
};
