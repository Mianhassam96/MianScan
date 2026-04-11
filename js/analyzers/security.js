const SecurityAnalyzer = {
  async analyze(url, doc) {
    const results = {
      https: false,
      headers: {},
      checks: [],
      score: 0,
      grade: 'F',
    };

    // HTTPS check
    results.https = url.startsWith('https://');

    // Try to fetch headers via a HEAD-like approach using allorigins
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        { signal: ctrl.signal }
      );
      clearTimeout(timer);
      if (res.ok) {
        // allorigins exposes some headers in the JSON response
        const json = await res.json();
        // Parse any security-relevant meta tags from the HTML as fallback
        const csp     = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || null;
        const refresh = doc.querySelector('meta[http-equiv="refresh"]')?.getAttribute('content') || null;
        results.headers = { csp, refresh };
      }
    } catch (_) {}

    // Analyze from HTML signals
    const html = doc.documentElement.innerHTML;

    // Mixed content check
    const hasMixedContent = /src=["']http:\/\//i.test(html) || /href=["']http:\/\//i.test(html);

    // External scripts from unknown CDNs
    const extScripts = [...doc.querySelectorAll('script[src]')]
      .map(s => s.getAttribute('src'))
      .filter(s => s && s.startsWith('http'));

    // Forms without HTTPS action
    const unsafeForms = [...doc.querySelectorAll('form[action]')]
      .filter(f => f.getAttribute('action')?.startsWith('http://'));

    // iframes (potential clickjacking surface)
    const iframeCount = doc.querySelectorAll('iframe').length;

    // Password fields
    const passwordFields = doc.querySelectorAll('input[type="password"]').length;

    // Autocomplete on sensitive fields
    const noAutocomplete = [...doc.querySelectorAll('input[type="password"],input[type="email"]')]
      .filter(i => i.getAttribute('autocomplete') === 'off').length;

    // CSP meta tag
    const hasCspMeta = !!doc.querySelector('meta[http-equiv="Content-Security-Policy"]');

    // Referrer policy
    const hasReferrerPolicy = !!doc.querySelector('meta[name="referrer"]') ||
      !!doc.querySelector('meta[name="referrerpolicy"]');

    // Build checks
    const checks = [];

    checks.push({
      type: results.https ? 'ok' : 'error',
      label: 'HTTPS',
      msg: results.https ? 'Site uses HTTPS — connection is encrypted' : 'Site is not using HTTPS — insecure',
      detail: results.https ? null : 'All modern sites must use HTTPS. Get a free SSL cert via Let\'s Encrypt.',
    });

    checks.push({
      type: hasMixedContent ? 'warn' : 'ok',
      label: 'Mixed Content',
      msg: hasMixedContent ? 'Mixed content detected — HTTP resources on HTTPS page' : 'No mixed content detected',
      detail: hasMixedContent ? 'HTTP resources on an HTTPS page can be blocked by browsers.' : null,
    });

    checks.push({
      type: hasCspMeta ? 'ok' : 'warn',
      label: 'Content Security Policy',
      msg: hasCspMeta ? 'CSP meta tag found' : 'No Content-Security-Policy meta tag found',
      detail: hasCspMeta ? null : 'CSP helps prevent XSS attacks. Add a CSP header or meta tag.',
    });

    checks.push({
      type: hasReferrerPolicy ? 'ok' : 'warn',
      label: 'Referrer Policy',
      msg: hasReferrerPolicy ? 'Referrer policy meta tag found' : 'No referrer policy found',
      detail: hasReferrerPolicy ? null : 'A referrer policy controls what info is sent when users click links.',
    });

    checks.push({
      type: unsafeForms.length > 0 ? 'error' : 'ok',
      label: 'Form Security',
      msg: unsafeForms.length > 0
        ? `${unsafeForms.length} form(s) submit to HTTP — data sent unencrypted`
        : 'No insecure form actions detected',
      detail: unsafeForms.length > 0 ? 'Forms submitting to HTTP expose user data.' : null,
    });

    checks.push({
      type: iframeCount > 2 ? 'warn' : 'ok',
      label: 'Iframes',
      msg: iframeCount > 2
        ? `${iframeCount} iframes found — review for clickjacking risk`
        : iframeCount > 0 ? `${iframeCount} iframe(s) found` : 'No iframes found',
      detail: iframeCount > 2 ? 'Excessive iframes can be a clickjacking vector.' : null,
    });

    checks.push({
      type: noAutocomplete > 0 ? 'warn' : 'ok',
      label: 'Autocomplete',
      msg: noAutocomplete > 0
        ? `${noAutocomplete} sensitive field(s) have autocomplete="off"`
        : 'Autocomplete settings look fine',
      detail: noAutocomplete > 0 ? 'Disabling autocomplete on password fields can hurt UX.' : null,
    });

    checks.push({
      type: extScripts.length > 10 ? 'warn' : 'ok',
      label: 'External Scripts',
      msg: `${extScripts.length} external script(s) loaded`,
      detail: extScripts.length > 10 ? 'Many external scripts increase attack surface.' : null,
    });

    results.checks = checks;

    // Score
    let score = 0;
    checks.forEach(c => {
      if (c.type === 'ok')    score += 12;
      else if (c.type === 'warn') score += 6;
    });
    results.score = Math.min(100, score);
    results.grade = results.score >= 80 ? 'A' : results.score >= 65 ? 'B' : results.score >= 50 ? 'C' : results.score >= 35 ? 'D' : 'F';
    results.extScripts = extScripts.slice(0, 20);
    results.iframeCount = iframeCount;
    results.passwordFields = passwordFields;

    return results;
  }
};
