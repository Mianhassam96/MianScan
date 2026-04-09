const CTAAnalyzer = {
    analyze(doc) {
        const btns = [...doc.querySelectorAll('a, button')]
            .map(el => ({
                text: el.textContent.trim().replace(/\s+/g,' '),
                href: el.href || el.getAttribute('href') || '',
                cls:  (el.className || '').toLowerCase()
            }))
            .filter(b => b.text && b.text.length > 1 && b.text.length < 60);

        const primary   = [];
        const secondary = [];
        const nav       = [];
        const footer    = [];

        btns.forEach(b => {
            const t = b.text.toLowerCase();
            const c = b.cls;
            if (/get started|start free|try free|sign up|free trial|get access|join now|start now|create account/i.test(t)) {
                primary.push(b.text);
            } else if (/learn more|view pricing|see pricing|explore|watch demo|book demo|contact us|request demo/i.test(t)) {
                secondary.push(b.text);
            } else if (/primary|cta|hero/i.test(c) && !primary.includes(b.text)) {
                primary.push(b.text);
            }
        });

        // Fallback: grab first 2 prominent buttons
        if (!primary.length) {
            btns.filter(b => /btn-primary|button--primary|cta/i.test(b.cls))
                .slice(0,2).forEach(b => primary.push(b.text));
        }

        return {
            primary:   [...new Set(primary)].slice(0,3),
            secondary: [...new Set(secondary)].slice(0,3),
            all:       [...new Set(btns.map(b => b.text))].slice(0,12)
        };
    }
};
