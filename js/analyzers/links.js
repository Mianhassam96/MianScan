const LinksAnalyzer = {
  analyze(doc, baseUrl) {
    const origin = new URL(baseUrl).origin;
    const all = [...doc.querySelectorAll('a[href]')];
    const internal = [], external = [], cta = [];

    const ctaPattern = /get started|sign up|free trial|contact|buy|shop|demo|pricing|learn more|download|subscribe|join|start|try/i;

    all.forEach(a => {
      const href = a.getAttribute('href') || '';
      const resolved = a.href || '';
      const text = a.textContent.trim().replace(/\s+/g,' ');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      const entry = { href: resolved || href, text: text.slice(0,80), anchor: text.slice(0,60) };

      // Bug fix: protocol-relative URLs (//cdn.example.com) are external —
      // was incorrectly caught by href.startsWith('/') and marked as internal.
      const isProtocolRelative = href.startsWith('//');
      const isRelative = !isProtocolRelative && (href.startsWith('/') || href.startsWith('#') || href.startsWith('.'));
      const isAbsoluteSameOrigin = (resolved || href).startsWith(origin);

      if (!isProtocolRelative && (isRelative || isAbsoluteSameOrigin)) {
        internal.push(entry);
      } else {
        external.push(entry);
      }
      if (ctaPattern.test(text)) cta.push(entry);
    });

    // Deduplicate by href
    const dedup = arr => {
      const seen = new Set();
      return arr.filter(l => { if (seen.has(l.href)) return false; seen.add(l.href); return true; });
    };

    return {
      internal: dedup(internal).slice(0, 40),
      external: dedup(external).slice(0, 40),
      cta:      dedup(cta).slice(0, 10),
      totalInternal: internal.length,
      totalExternal: external.length,
    };
  }
};
