const StructureAnalyzer = {
  analyze(doc) {
    const q = s => doc.querySelectorAll(s).length;
    // Bug fix: Navbar was counting [class*="nav-"] which matched individual nav
    // items (nav-item, nav-link etc.) — a site with 50 nav links all using
    // nav-item class was counted as 50 navbars. Now only counts distinct nav
    // container elements, not individual items within them.
    const counts = {
      Header:       q('header, [class*="header"]:not([class*="header-item"]):not([class*="header-link"]), [id*="header"]'),
      Navbar:       q('nav, [class*="navbar"], [class*="nav-wrap"], [class*="nav-menu"], [class*="navigation"]:not([class*="navigation-item"]), [id*="nav"]'),
      Hero:         q('[class*="hero"], [class*="banner"]:not([class*="banner-item"]), [class*="jumbotron"]'),
      Sections:     q('section'),
      Cards:        q('[class*="card"]:not([class*="card-body"]):not([class*="card-title"]):not([class*="card-text"])'),
      Features:     q('[class*="feature"]:not([class*="feature-item"]):not([class*="feature-icon"]), [id*="feature"]'),
      Pricing:      q('[class*="pricing"]:not([class*="pricing-item"]):not([class*="pricing-col"]), [id*="pricing"]'),
      Testimonials: q('[class*="testimonial"]:not([class*="testimonial-item"]), [class*="review"]:not([class*="review-item"])'),
      CTA:          q('[class*="cta"]:not([class*="cta-btn"]):not([class*="cta-text"]):not([class*="cta-link"]), [id*="cta"]'),
      Footer:       q('footer, [class*="footer"]:not([class*="footer-link"]):not([class*="footer-item"]):not([class*="footer-col"]), [id*="footer"]'),
      Forms:        q('form'),
      Buttons:      q('button, [class*="btn"], input[type="button"], input[type="submit"]'),
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
