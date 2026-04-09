const ContactAnalyzer = {
    analyze(doc, html) {
        const text = doc.body?.innerHTML || html;

        const emails = [...new Set(text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])].slice(0,8);

        const phones = [...new Set(
            (text.match(/(\+?\d[\d\s\-().]{7,}\d)/g) || [])
                .map(p => p.trim())
                .filter(p => p.replace(/\D/g,'').length >= 7)
        )].slice(0,5);

        const links = [...doc.querySelectorAll('a[href]')].map(a => a.href);
        const social = {
            Twitter:   links.find(l => l.includes('twitter.com') || l.includes('x.com')) || '',
            Facebook:  links.find(l => l.includes('facebook.com')) || '',
            LinkedIn:  links.find(l => l.includes('linkedin.com')) || '',
            Instagram: links.find(l => l.includes('instagram.com')) || '',
            YouTube:   links.find(l => l.includes('youtube.com')) || '',
            GitHub:    links.find(l => l.includes('github.com')) || '',
            WhatsApp:  links.find(l => l.includes('wa.me') || l.includes('whatsapp.com')) || '',
        };

        // Remove empty
        Object.keys(social).forEach(k => { if (!social[k]) delete social[k]; });

        return { emails, phones, social };
    }
};
