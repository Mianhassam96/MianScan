const CTAAnalyzer = {
  analyze(doc) {
    const els = [...doc.querySelectorAll('a,button')]
      .map(el => ({ text: el.textContent.trim().replace(/\s+/g,' '), cls: (el.className||'').toLowerCase() }))
      .filter(b => b.text && b.text.length > 1 && b.text.length < 60);
    const primary = [], secondary = [];
    els.forEach(b => {
      if (/get started|start free|try free|sign up|free trial|get access|join now|start now|create account|get demo/i.test(b.text))
        primary.push(b.text);
      else if (/learn more|view pricing|see pricing|explore|watch demo|book demo|contact us|request demo|see plans/i.test(b.text))
        secondary.push(b.text);
    });
    if (!primary.length) {
      els.filter(b => /btn-primary|button--primary|cta/i.test(b.cls)).slice(0,2).forEach(b => primary.push(b.text));
    }
    return {
      primary:   [...new Set(primary)].slice(0,3),
      secondary: [...new Set(secondary)].slice(0,3),
      all:       [...new Set(els.map(b=>b.text))].slice(0,20)
    };
  }
};
