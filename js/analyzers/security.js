const SecurityAnalyzer = {
  async analyze(url, doc, html = '') {
    const results = {
      https: url.startsWith('https://'),
      checks: [],
      score: 0,
      grade: 'F',
      extScripts: [],
      iframeCount: 0,
      passwordFields: 0,
    };

    const fullHtml = html || doc.documentElement.innerHTML;

    // ── Mixed content
    const hasMixedContent = /src=["']http:\/\//i.test(fullHtml) || /href=["']http:\/\//i.test(fullHtml);

    // ── External scripts
    const extScripts = [...doc.querySelectorAll('script[src]')]
      .map(s => s.getAttribute('src'))
      .filter(s => s && (s.startsWith('http://') || s.startsWith('https://')));

    // ── Unsafe forms
    const unsafeForms = [...doc.querySelectorAll('form[action]')]
      .filter(f => (f.getAttribute('action') || '').startsWith('http://'));

    // ── iframes
    const iframeCount = doc.querySelectorAll('iframe').length;

    // ── Password fields
    const passwordFields = doc.querySelectorAll('input[type="password"]').length;

    // ── CSP meta tag
    const hasCspMeta = !!doc.querySelector('meta[http-equiv="Content-Security-Policy"]');

    // ── Referrer policy
    const hasReferrerPolicy = !!doc.querySelector('meta[name="referrer"]') ||
      !!doc.querySelector('meta[name="referrerpolicy"]') ||
      /referrer-policy/i.test(fullHtml);

    // ── X-Frame-Options equivalent (CSP frame-ancestors)
    const hasFrameGuard = hasCspMeta &&
      /frame-ancestors/i.test(doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || '');

    // ── Subresource Integrity on scripts
    const scriptsWithSRI = [...doc.querySelectorAll('script[src][integrity]')].length;
    const scriptsWithoutSRI = extScripts.length - scriptsWithSRI;

    // ── Autocomplete on sensitive fields
    const noAutocomplete = [...doc.querySelectorAll('input[type="password"],input[type="email"]')]
      .filter(i => i.getAttribute('autocomplete') === 'off').length;

    // ── Open redirect patterns
    const hasOpenRedirect = /window\.location\s*=\s*[^;]*\?/i.test(fullHtml) ||
      /document\.location\s*=\s*[^;]*\?/i.test(fullHtml);

    // ── Inline event handlers (XSS surface)
    const inlineHandlers = (fullHtml.match(/\bon\w+\s*=/gi) || []).length;

    // ── Build checks
    const checks = [];

    checks.push({
      type: results.https ? 'ok' : 'error',
      label: 'HTTPS / SSL',
      msg: results.https
        ? 'Site uses HTTPS — connection is encrypted'
        : 'Site is not using HTTPS — all data is sent in plain text',
      detail: results.https ? null : 'Get a free SSL certificate via Let\'s Encrypt.',
    });

    checks.push({
      type: hasMixedContent ? 'warn' : 'ok',
      label: 'Mixed Content',
      msg: hasMixedContent
        ? 'Mixed content detected — HTTP resources loaded on HTTPS page'
        : 'No mixed content detected',
      detail: hasMixedContent ? 'HTTP resources on HTTPS pages can be blocked by browsers.' : null,
    });

    checks.push({
      type: hasCspMeta ? 'ok' : 'warn',
      label: 'Content Security Policy',
      msg: hasCspMeta
        ? 'CSP meta tag found'
        : 'No Content-Security-Policy found — XSS risk',
      detail: hasCspMeta ? null : 'Add a CSP header or meta tag to prevent cross-site scripting.',
    });

    checks.push({
      type: hasReferrerPolicy ? 'ok' : 'warn',
      label: 'Referrer Policy',
      msg: hasReferrerPolicy
        ? 'Referrer policy found'
        : 'No referrer policy — user navigation data may leak',
      detail: hasReferrerPolicy ? null : 'Add <meta name="referrer" content="strict-origin-when-cross-origin">',
    });

    checks.push({
      type: unsafeForms.length > 0 ? 'error' : 'ok',
      label: 'Form Security',
      msg: unsafeForms.length > 0
        ? `${unsafeForms.length} form(s) submit to HTTP — data sent unencrypted`
        : 'No insecure form actions detected',
      detail: unsafeForms.length > 0 ? 'Change form action URLs to HTTPS.' : null,
    });

    checks.push({
      type: iframeCount > 3 ? 'warn' : 'ok',
      label: 'Iframes',
      msg: iframeCount > 3
        ? `${iframeCount} iframes — review for clickjacking risk`
        : iframeCount > 0 ? `${iframeCount} iframe(s) found — looks fine`
        : 'No iframes found',
    });

    checks.push({
      type: scriptsWithoutSRI > 5 ? 'warn' : 'ok',
      label: 'Subresource Integrity',
      msg: scriptsWithSRI > 0
        ? `${scriptsWithSRI} script(s) use SRI integrity checks`
        : extScripts.length > 0
          ? `${extScripts.length} external scripts loaded without SRI`
          : 'No external scripts found',
      detail: scriptsWithoutSRI > 5 ? 'Add integrity="" attributes to external scripts to prevent supply-chain attacks.' : null,
    });

    checks.push({
      type: inlineHandlers > 20 ? 'warn' : 'ok',
      label: 'Inline Event Handlers',
      msg: inlineHandlers > 20
        ? `${inlineHandlers} inline event handlers (onclick, onload…) — increases XSS surface`
        : `${inlineHandlers} inline event handler(s) — acceptable`,
      detail: inlineHandlers > 20 ? 'Move event handlers to external JS files.' : null,
    });

    checks.push({
      type: noAutocomplete > 0 ? 'warn' : 'ok',
      label: 'Autocomplete',
      msg: noAutocomplete > 0
        ? `${noAutocomplete} sensitive field(s) have autocomplete="off"`
        : 'Autocomplete settings look fine',
    });

    checks.push({
      type: extScripts.length > 15 ? 'warn' : 'ok',
      label: 'External Scripts',
      msg: `${extScripts.length} external script(s) loaded`,
      detail: extScripts.length > 15 ? 'Many external scripts increase attack surface and slow load time.' : null,
    });

    results.checks = checks;

    // ── Score: ok=10pts, warn=4pts, error=0pts
    let score = 0;
    checks.forEach(c => {
      if (c.type === 'ok')   score += 10;
      else if (c.type === 'warn') score += 4;
    });
    results.score    = Math.min(100, score);
    results.grade    = results.score >= 85 ? 'A' : results.score >= 70 ? 'B' : results.score >= 55 ? 'C' : results.score >= 40 ? 'D' : 'F';
    results.extScripts    = extScripts.slice(0, 20);
    results.iframeCount   = iframeCount;
    results.passwordFields = passwordFields;

    return results;
  }
};
