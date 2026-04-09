const StructureAnalyzer = {
    analyze(doc) {
        const q = s => doc.querySelectorAll(s).length;
        const sections = {
            Header:   q('header, [class*="header"], [id*="header"]'),
            Navbar:   q('nav, [class*="navbar"], [class*="nav-"], [class*="menu"]'),
            Hero:     q('[class*="hero"], [class*="banner"], [class*="jumbotron"], [class*="masthead"]'),
            Sections: q('section'),
            Cards:    q('[class*="card"]'),
            Features: q('[class*="feature"], [id*="feature"]'),
            Pricing:  q('[class*="pricing"], [id*="pricing"]'),
            Testimonials: q('[class*="testimonial"], [class*="review"], [id*="testimonial"]'),
            CTA:      q('[class*="cta"], [id*="cta"]'),
            Footer:   q('footer, [class*="footer"], [id*="footer"]'),
            Forms:    q('form'),
            Buttons:  q('button, [class*="btn"], input[type="button"], input[type="submit"]'),
            Links:    q('a[href]'),
        };

        const tree = Object.entries(sections)
            .filter(([, v]) => v > 0)
            .map(([label, count]) => ({ label, count }));

        const icons = {
            Header:'layout-text-window', Navbar:'list-ul', Hero:'star',
            Sections:'layout-split', Cards:'card-text', Features:'lightning',
            Pricing:'tag', Testimonials:'chat-quote', CTA:'cursor',
            Footer:'layout-text-window-reverse', Forms:'ui-checks',
            Buttons:'toggles', Links:'link-45deg'
        };

        return { sections, tree: tree.map(t => ({ ...t, icon: icons[t.label] || 'dot' })), totalElements: doc.querySelectorAll('*').length };
    }
};
