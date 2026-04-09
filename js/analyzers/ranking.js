const RankingAnalyzer = {
  async analyze(url) {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const result = {
      hostname,
      globalRank: null,
      countryRank: null,
      category: null,
      trafficEst: null,
      source: null,
      error: null
    };

    // Try Open PageRank for rank data
    try {
      const res = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
        { headers: { 'API-OPR': 'free' }, signal: AbortSignal.timeout(7000) }
      );
      if (res.ok) {
        const data = await res.json();
        const entry = data?.response?.[0];
        if (entry) {
          result.globalRank = entry.rank || null;
          result.pageRank   = entry.page_rank_integer ?? null;
          result.source     = 'Open PageRank';
        }
      }
    } catch(_) {}

    // Try Similarweb-style via a free proxy (no key needed)
    try {
      const res = await fetch(
        `https://api.codetabs.com/v1/proxy?quest=https://data.similarweb.com/api/v1/data?domain=${hostname}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.GlobalRank?.Rank) result.globalRank = data.GlobalRank.Rank;
        if (data?.CountryRank?.CountryCode) result.countryRank = data.CountryRank.Rank;
        if (data?.Category) result.category = data.Category;
        if (data?.EstimatedMonthlyVisits) {
          const visits = Object.values(data.EstimatedMonthlyVisits).pop();
          result.trafficEst = visits ? this._formatNum(visits) : null;
        }
        result.source = 'SimilarWeb';
      }
    } catch(_) {}

    return result;
  },

  _formatNum(n) {
    if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return String(n);
  }
};
