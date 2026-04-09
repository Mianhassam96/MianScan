const ContactAnalyzer = {
  analyze(doc, html) {
    const src = doc.body ? doc.body.innerHTML : html;
    const emails = [...new Set(src.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)||[])].slice(0,8);
    const phones = [...new Set(
      (src.match(/(\+?\d[\d\s\-().]{7,}\d)/g)||[]).map(p=>p.trim()).filter(p=>p.replace(/\D/g,'').length>=7)
    )].slice(0,5);
    const hrefs = [...doc.querySelectorAll('a[href]')].map(a=>a.href);
    const find = patterns => hrefs.find(l => patterns.some(p => l.includes(p))) || '';
    const social = {};
    const s = {
      Twitter:   ['twitter.com','x.com'],
      Facebook:  ['facebook.com'],
      LinkedIn:  ['linkedin.com'],
      Instagram: ['instagram.com'],
      YouTube:   ['youtube.com'],
      GitHub:    ['github.com'],
      WhatsApp:  ['wa.me','whatsapp.com'],
    };
    Object.entries(s).forEach(([k,v]) => { const r = find(v); if (r) social[k] = r; });
    return { emails, phones, social };
  }
};
