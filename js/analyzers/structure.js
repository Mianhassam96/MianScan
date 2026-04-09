const StructureAnalyzer = {
    analyze(doc) {
        const sections = {
            header: doc.querySelectorAll('header, [class*="header"], [id*="header"]').length,
            nav: doc.querySelectorAll('nav, [class*="nav"], [class*="menu"]').length,
            hero: doc.querySelectorAll('[class*="hero"], [class*="banner"], [class*="jumbotron"]').length,
            sections: doc.querySelectorAll('section').length,
            cards: doc.querySelectorAll('[class*="card"]').length,
            footer: doc.querySelectorAll('footer, [class*="footer"]').length,
            forms: doc.querySelectorAll('form').length,
            buttons: doc.querySelectorAll('button, [class*="btn"], input[type="button"], input[type="submit"]').length,
            links: doc.querySelectorAll('a[href]').length,
            lists: doc.querySelectorAll('ul, ol').length,
            tables: doc.querySelectorAll('table').length,
            divs: doc.querySelectorAll('div').length,
        };

        // Build layout tree
        const tree = [];
        if (sections.header) tree.push({ label: 'Header', icon: 'layout-text-window', count: sections.header });
        if (sections.nav) tree.push({ label: 'Navigation', icon: 'list-ul', count: sections.nav });
        if (sections.hero) tree.push({ label: 'Hero Section', icon: 'star', count: sections.hero });
        if (sections.sections) tree.push({ label: 'Sections', icon: 'layout-split', count: sections.sections });
        if (sections.cards) tree.push({ label: 'Cards', icon: 'card-text', count: sections.cards });
        if (sections.forms) tree.push({ label: 'Forms', icon: 'ui-checks', count: sections.forms });
        if (sections.buttons) tree.push({ label: 'Buttons', icon: 'toggles', count: sections.buttons });
        if (sections.footer) tree.push({ label: 'Footer', icon: 'layout-text-window-reverse', count: sections.footer });

        return { sections, tree, totalElements: doc.querySelectorAll('*').length };
    }
};
