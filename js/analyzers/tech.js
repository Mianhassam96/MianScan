const TechAnalyzer = {
    signatures: [
        { name: 'React', pattern: /react(?:\.min)?\.js|__react|ReactDOM/i },
        { name: 'Vue.js', pattern: /vue(?:\.min)?\.js|__vue__|Vue\.component/i },
        { name: 'Angular', pattern: /angular(?:\.min)?\.js|ng-version|ng-app/i },
        { name: 'Next.js', pattern: /__NEXT_DATA__|next\/static|_next\/static/i },
        { name: 'Nuxt.js', pattern: /__nuxt__|nuxt\.js/i },
        { name: 'Svelte', pattern: /svelte|__svelte/i },
        { name: 'jQuery', pattern: /jquery(?:\.min)?\.js|jQuery\s*\(/i },
        { name: 'Bootstrap', pattern: /bootstrap(?:\.min)?\.(?:css|js)|data-bs-/i },
        { name: 'Tailwind CSS', pattern: /tailwind(?:css)?(?:\.min)?\.css|class="[^"]*(?:flex|grid|px-|py-|text-|bg-|rounded)/i },
        { name: 'WordPress', pattern: /wp-content|wp-includes|wordpress/i },
        { name: 'Shopify', pattern: /shopify|cdn\.shopify\.com/i },
        { name: 'Webflow', pattern: /webflow\.com|webflow\.js/i },
        { name: 'Framer', pattern: /framer\.com|framerusercontent/i },
        { name: 'Google Analytics', pattern: /google-analytics\.com|gtag\(|ga\('send/i },
        { name: 'Google Tag Manager', pattern: /googletagmanager\.com/i },
        { name: 'Cloudflare', pattern: /cloudflare|__cf_bm/i },
        { name: 'Stripe', pattern: /stripe\.com\/v3|Stripe\(/i },
        { name: 'Intercom', pattern: /intercom\.io|window\.Intercom/i },
        { name: 'HubSpot', pattern: /hubspot\.com|hs-scripts/i },
        { name: 'Hotjar', pattern: /hotjar\.com|hjSetting/i },
        { name: 'Vercel', pattern: /vercel\.app|_vercel/i },
        { name: 'Netlify', pattern: /netlify\.app|netlify\.com/i },
        { name: 'Font Awesome', pattern: /font-awesome|fontawesome/i },
        { name: 'GSAP', pattern: /gsap(?:\.min)?\.js|TweenMax|TweenLite/i },
        { name: 'Three.js', pattern: /three(?:\.min)?\.js|THREE\./i },
        { name: 'Webpack', pattern: /webpack|__webpack_require__/i },
        { name: 'Vite', pattern: /vite\/client|@vite\/client/i },
    ],

    analyze(doc, html) {
        const detected = [];
        this.signatures.forEach(sig => {
            if (sig.pattern.test(html)) {
                detected.push(sig.name);
            }
        });

        // Scripts count
        const scripts = doc.querySelectorAll('script[src]');
        const scriptSrcs = [...scripts].map(s => s.getAttribute('src')).filter(Boolean);

        // Meta generator
        const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
        if (generator && !detected.includes(generator)) detected.push(generator);

        return {
            detected: [...new Set(detected)],
            scriptsCount: scripts.length,
            scriptSrcs: scriptSrcs.slice(0, 15),
            generator
        };
    }
};
