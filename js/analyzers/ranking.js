const RankingAnalyzer = {
  async analyze(url) {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const result = {
      hostname,
      globalRank: null,
      pageRank: null,
      source: null,
      error: null
    };

    // Open PageRank API (CORS-friendly, no key required for basic use)
    try {
      const res = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
        { headers: { 'API-OPR': 'free' }, signal: AbortSignal.timeout(7000) }
      );
      if (res.ok) {
        const data = await res.json();
        const entry = data?.response?.[0];
        if (entry && (entry.rank || entry.page_rank_integer != null)) {
          result.globalRank = entry.rank || null;
          result.pageRank   = entry.page_rank_integer ?? null;
          result.source     = 'Open PageRank';
        }
      }
    } catch (_) {
      result.error = 'Open PageRank request failed';
    }

    if (!result.source) {
      result.error = 'Ranking data not available — APIs may be blocked or domain not indexed';
    }

    return result;
  }
};
