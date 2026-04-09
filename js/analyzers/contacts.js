const ContactAnalyzer = {
  analyze(doc, html) {
    const src = doc.body ? doc.body.innerHTML : html;
    const text = doc.body ? doc.body.textContent : html;

    // Emails
    const emails = [...new Set(
      src.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)||[]
    )].filter(e => !e.endsWith('.png') && !e.endsWith('.jpg')).slice(0,10);

    // Phones
    const phones = [...new Set(
      (src.match(/(\+?\d[\d\s\-().]{7,}\d)/g)||[])
        .map(p => p.trim())
        .filter(p => p.replace(/\D/g,'').length >= 7 && p.replace(/\D/g,'').length <= 15)
    )].slice(0,6);

    // WhatsApp links
    const allHrefs = [...doc.querySelectorAll('a[href]')].map(a => a.getAttribute('href')||'');
    const whatsapp = allHrefs.filter(h => h.includes('wa.me') || h.includes('whatsapp.com/send')).slice(0,3);

    // Address (heuristic)
    const addrReg = /\d{1,5}\s+[\w\s]{3,30}(?:street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr|way|court|ct|plaza|square|sq|block)/gi;
    const addresses = [...new Set(text.match(addrReg)||[])].slice(0,3);

    // Contact page link
    const contactPage = allHrefs.find(h => /contact|reach|support|help/i.test(h)) || '';

    // Social media — find ALL occurrences not just first
    const hrefs = [...doc.querySelectorAll('a[href]')].map(a => a.href);
    const socialMap = {
      Twitter:   ['twitter.com','x.com'],
      Facebook:  ['facebook.com'],
      LinkedIn:  ['linkedin.com'],
      Instagram: ['instagram.com'],
      YouTube:   ['youtube.com'],
      GitHub:    ['github.com'],
      TikTok:    ['tiktok.com'],
      Pinterest: ['pinterest.com'],
      Telegram:  ['t.me','telegram.me'],
    };
    const social = {};
    Object.entries(socialMap).forEach(([k,patterns]) => {
      const found = [...new Set(hrefs.filter(l => patterns.some(p => l.includes(p))))].slice(0,2);
      if (found.length) social[k] = found;
    });

    return { emails, phones, whatsapp, addresses, contactPage, social };
  }
};
