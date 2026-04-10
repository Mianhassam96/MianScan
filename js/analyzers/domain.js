const DomainAnalyzer = {
  async analyze(url) {
    const raw = new URL(url).hostname;
    const hostname = raw.replace(/^www\./, '');

    const result = {
      hostname,
      da: null,
      rank: null,
      age: null,
      error: null,
      daNote: 'Estimated from on-page signals'
    };

    // Try Open PageRank (works without key for basic domains)
    try {
      const res = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${hostname}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const data = await res.json();
        const entry = data?.response?.[0];
        if (entry) {
          if (entry.page_rank_integer != null) {
            result.da = entry.page_rank_integer;
            result.daNote = 'Open PageRank (0–10)';
          }
          if (entry.rank) result.rank = entry.rank;
        }
      }
    } catch (_) {}

    // Try domain age via RDAP (free, no key, CORS-friendly)
    try {
      const res = await fetch(
        `https://rdap.org/domain/${hostname}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const events = data?.events || [];
        const reg = events.find(e => e.eventAction === 'registration');
        if (reg?.eventDate) {
          result.age = reg.eventDate.split('T')[0];
        }
      }
    } catch (_) {}

    return result;
  }
};
