const ContactAnalyzer = {
  analyze(doc, html) {
    // Use raw HTML string for regex — more reliable than parsed DOM
    const rawHtml = html || doc.body?.innerHTML || '';
    const rawText = doc.body?.textContent || '';

    /* ── Emails ── */
    const emailReg = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}/g;
    const emails = [...new Set(rawHtml.match(emailReg) || [])]
      .filter(e => !/(\.png|\.jpg|\.gif|\.svg|\.webp|sentry|example|test@)/.test(e))
      .slice(0, 10);

    /* ── Phones ── */
    const phoneReg = /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/g;
    const phones = [...new Set(
      (rawHtml.match(phoneReg) || [])
        .map(p => p.trim())
        .filter(p => {
          const digits = p.replace(/\D/g, '');
          return digits.length >= 7 && digits.length <= 15;
        })
    )].slice(0, 6);

    /* ── Use getAttribute to get raw href before base tag resolves them ── */
    const rawLinks = [...doc.querySelectorAll('a[href]')]
      .map(a => ({
        raw: a.getAttribute('href') || '',
        abs: a.href || ''
      }));

    /* ── WhatsApp ── */
    const whatsapp = rawLinks
      .filter(l => l.raw.includes('wa.me') || l.raw.includes('whatsapp.com') || l.abs.includes('wa.me'))
      .map(l => l.abs || l.raw)
      .slice(0, 3);

    /* ── Contact page ── */
    const contactPage = rawLinks.find(l =>
      /\/(contact|reach|support|help|about)/i.test(l.raw)
    )?.abs || '';

    /* ── Social media — match against absolute URLs ── */
    const socialPatterns = {
      Twitter:   [/twitter\.com\/(?!intent|share|home|search)[a-zA-Z0-9_]+/],
      'X (Twitter)': [/x\.com\/(?!intent|share|home|search)[a-zA-Z0-9_]+/],
      Facebook:  [/facebook\.com\/(?!sharer|share|dialog)[a-zA-Z0-9._\-]+/],
      LinkedIn:  [/linkedin\.com\/(company|in|school)\/[a-zA-Z0-9_\-]+/],
      Instagram: [/instagram\.com\/[a-zA-Z0-9._]+/],
      YouTube:   [/youtube\.com\/(channel|c|user|@)[a-zA-Z0-9_\-]+/],
      GitHub:    [/github\.com\/[a-zA-Z0-9_\-]+/],
      TikTok:    [/tiktok\.com\/@[a-zA-Z0-9._]+/],
      Pinterest: [/pinterest\.com\/[a-zA-Z0-9_]+/],
      Telegram:  [/t\.me\/[a-zA-Z0-9_]+/],
    };

    const social = {};
    Object.entries(socialPatterns).forEach(([platform, patterns]) => {
      const found = [];
      rawLinks.forEach(l => {
        const url = l.abs || l.raw;
        if (patterns.some(p => p.test(url)) && !found.includes(url)) {
          found.push(url);
        }
      });
      if (found.length) social[platform] = found.slice(0, 2);
    });

    /* ── Addresses ── */
    const addrReg = /\d{1,5}\s+[\w\s]{3,30}(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd|lane|ln|drive|dr\.?|way|court|ct\.?|plaza|square)/gi;
    const addresses = [...new Set(rawText.match(addrReg) || [])].slice(0, 3);

    return { emails, phones, whatsapp, addresses, contactPage, social };
  }
};
