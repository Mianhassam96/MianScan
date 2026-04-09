const ContactAnalyzer = {
    analyze(doc, html) {
        const text = doc.body?.innerHTML || html;

        // Emails
        const emailReg = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
        const emails = [...new Set(text.match(emailReg) || [])].slice(0, 10);

        // Phone numbers
        const phoneReg = /(\+?\d[\d\s\-().]{7,}\d)/g;
        const phones = [...new Set((text.match(phoneReg) || []).map(p => p.trim()).filter(p => p.replace(/\D/g, '').length >= 7))].slice(0, 5);

        // Social links
        const links = [...doc.querySelectorAll('a[href]')].map(a => a.href);
        const socials = {
            twitter: links.filter(l => l.includes('twitter.com') || l.includes('x.com')),
            facebook: links.filter(l => l.includes('facebook.com')),
            linkedin: links.filter(l => l.includes('linkedin.com')),
            instagram: links.filter(l => l.includes('instagram.com')),
            youtube: links.filter(l => l.includes('youtube.com')),
            github: links.filter(l => l.includes('github.com')),
            whatsapp: links.filter(l => l.includes('wa.me') || l.includes('whatsapp.com')),
        };

        // Filter to unique first entries
        Object.keys(socials).forEach(k => {
            socials[k] = [...new Set(socials[k])].slice(0, 2);
        });

        // Address (basic heuristic)
        const addressReg = /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr|way|court|ct|plaza|square|sq)/gi;
        const addresses = [...new Set(text.match(addressReg) || [])].slice(0, 3);

        return { emails, phones, socials, addresses };
    }
};
