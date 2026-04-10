const RankingAnalyzer = {
  async analyze(url) {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const result = {
      hostname,
      globalRank: null,
      pageRank: null,
      trafficEst: null,
      source: null,
      error: null
    };

    // Open PageRank — free, no key needed for basic use
    try {
      const res = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const data = await res.json();
        const entry = data?.response?.[0];
        if (entry) {
          if (entry.rank)                    result.globalRank = entry.rank;
          if (entry.page_rank_integer != null) result.pageRank = entry.page_rank_integer;
          if (result.globalRank || result.pageRank != null) result.source = 'Open PageRank';
        }
      }
    } catch (_) {}

    // Fallback: try Tranco list via a CORS proxy for top sites
    if (!result.source) {
      try {
        const res = await fetch(
          `https://corsproxy.io/?${encodeURIComponent(`https://tranco-list.eu/api/ranks/domain/${hostname}`)}`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.ranks?.length) {
            result.globalRank = data.ranks[0]?.rank || null;
            result.source = 'Tranco';
          }
        }
      } catch (_) {}
    }

    if (!result.source) {
      result.error = 'Ranking data not available for this domain';
    }

    return result;
  }
};
