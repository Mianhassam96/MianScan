const StructureAnalyzer = {
  analyze(doc) {
    const q = s => doc.querySelectorAll(s).length;
    const counts = {
      Header:       q('header,[class*="header"],[id*="header"]'),
      Navbar:       q('nav,[class*="navbar"],[class*="nav-"],[class*="menu"]'),
      Hero:         q('[class*="hero"],[class*="banner"],[class*="jumbotron"]'),
      Sections:     q('section'),
      Cards:        q('[class*="card"]'),
      Features:     q('[class*="feature"],[id*="feature"]'),
      Pricing:      q('[class*="pricing"],[id*="pricing"]'),
      Testimonials: q('[class*="testimonial"],[class*="review"]'),
      CTA:          q('[class*="cta"],[id*="cta"]'),
      Footer:       q('footer,[class*="footer"],[id*="footer"]'),
      Forms:        q('form'),
      Buttons:      q('button,[class*="btn"],input[type="button"],input[type="submit"]'),
      Links:        q('a[href]'),
    };
    const iconMap = {
      Header:'layout-text-window', Navbar:'list-ul', Hero:'star',
      Sections:'layout-split', Cards:'card-text', Features:'lightning',
      Pricing:'tag', Testimonials:'chat-quote', CTA:'cursor',
      Footer:'layout-text-window-reverse', Forms:'ui-checks',
      Buttons:'toggles', Links:'link-45deg'
    };
    const tree = Object.entries(counts)
      .filter(([,v]) => v > 0)
      .map(([label, count]) => ({ label, count, icon: iconMap[label]||'dot' }));

    // Components detected list (for the components panel)
    const componentKeys = ['Header','Navbar','Hero','Features','Pricing','Testimonials','CTA','Footer','Forms'];
    const components = componentKeys.map(k => ({ name: k, found: counts[k] > 0 }));

    return { counts, tree, components, totalElements: doc.querySelectorAll('*').length };
  }
};
