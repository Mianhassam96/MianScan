const CTAAnalyzer = {
  analyze(doc) {
    const els = [...doc.querySelectorAll('a,button')]
      .map(el => ({ text: el.textContent.trim().replace(/\s+/g,' '), cls: (el.className||'').toLowerCase() }))
      .filter(b => b.text && b.text.length > 1 && b.text.length < 60);

    // Primary CTA keywords — English + common international phrases
    const primaryPattern = /get started|start free|try free|sign up|free trial|get access|join now|start now|create account|get demo|book a call|request a quote|buy now|order now|subscribe|book now|hire us|work with us|claim your|start today|download now|get your free|talk to us|schedule a call|see pricing|view plans|شروع کریں|ابھی شروع|خریدیں|حاصل کریں|ابھی رجسٹر/i;

    // Secondary CTA keywords
    const secondaryPattern = /learn more|view pricing|see pricing|explore|watch demo|book demo|contact us|request demo|see plans|find out more|read more|discover|see how|view all|get in touch/i;

    const primary = [], secondary = [];
    els.forEach(b => {
      if (primaryPattern.test(b.text))   primary.push(b.text);
      else if (secondaryPattern.test(b.text)) secondary.push(b.text);
    });

    // Class-based fallback — expanded to cover more framework conventions
    if (!primary.length) {
      els.filter(b =>
        /btn-primary|button--primary|\bcta\b|btn-cta|button-cta|hero-btn|cta-btn|primary-btn|main-cta/i.test(b.cls)
      ).slice(0, 2).forEach(b => primary.push(b.text));
    }

    return {
      primary:   [...new Set(primary)].slice(0, 3),
      secondary: [...new Set(secondary)].slice(0, 3),
      all:       [...new Set(els.map(b => b.text))].slice(0, 20)
    };
  }
};
