const RankingAnalyzer = {
  async analyze(url) {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const result = {
      hostname,
      globalRank: null,
      pageRank: null,
      trafficEst: null,
      source: null,
      error: null,
      // PageSpeed data
      perfScore: null,
      fcp: null,
      lcp: null,
      cls: null,
      tbt: null,
      speedSource: null,
    };

    await Promise.allSettled([

      // ── Open PageRank
      (async () => {
        try {
          const res = await fetch(
            `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (res.ok) {
            const data = await res.json();
            const entry = data?.response?.[0];
            if (entry) {
              if (entry.rank)                      result.globalRank = entry.rank;
              if (entry.page_rank_integer != null) result.pageRank   = entry.page_rank_integer;
              if (result.globalRank || result.pageRank != null) result.source = 'Open PageRank';
            }
          }
        } catch (_) {}
      })(),

      // ── Tranco list fallback
      (async () => {
        if (result.source) return;
        try {
          const res = await fetch(
            `https://corsproxy.io/?${encodeURIComponent(`https://tranco-list.eu/api/ranks/domain/${hostname}`)}`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.ranks?.length) {
              result.globalRank = data.ranks[0]?.rank || null;
              result.source     = 'Tranco';
            }
          }
        } catch (_) {}
      })(),

      // ── Google PageSpeed Insights (free, no key for basic use)
      (async () => {
        try {
          const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`;
          const res = await fetch(apiUrl, { signal: AbortSignal.timeout(20000) });
          if (res.ok) {
            const data = await res.json();
            const cats = data?.lighthouseResult?.categories;
            const audits = data?.lighthouseResult?.audits;
            if (cats?.performance?.score != null) {
              result.perfScore  = Math.round(cats.performance.score * 100);
              result.speedSource = 'Google PageSpeed';
            }
            if (audits) {
              result.fcp = audits['first-contentful-paint']?.displayValue || null;
              result.lcp = audits['largest-contentful-paint']?.displayValue || null;
              result.cls = audits['cumulative-layout-shift']?.displayValue || null;
              result.tbt = audits['total-blocking-time']?.displayValue || null;
            }
          }
        } catch (_) {}
      })(),

    ]);

    if (!result.source) {
      result.error = 'Ranking data not available for this domain';
    }

    return result;
  }
};
