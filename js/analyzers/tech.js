const TechAnalyzer = {
    sigs: [
        { name:'React',           p:/react(?:\.min)?\.js|__react|ReactDOM/i },
        { name:'Vue.js',          p:/vue(?:\.min)?\.js|__vue__|Vue\.component/i },
        { name:'Angular',         p:/angular(?:\.min)?\.js|ng-version|ng-app/i },
        { name:'Next.js',         p:/__NEXT_DATA__|_next\/static/i },
        { name:'Nuxt.js',         p:/__nuxt__|nuxt\.js/i },
        { name:'Svelte',          p:/svelte|__svelte/i },
        { name:'jQuery',          p:/jquery(?:\.min)?\.js|jQuery\s*\(/i },
        { name:'Bootstrap',       p:/bootstrap(?:\.min)?\.(?:css|js)|data-bs-/i },
        { name:'Tailwind CSS',    p:/tailwind(?:css)?(?:\.min)?\.css|class="[^"]*(?:flex|grid|px-|py-|text-|bg-|rounded)/i },
        { name:'WordPress',       p:/wp-content|wp-includes|wordpress/i },
        { name:'Shopify',         p:/shopify|cdn\.shopify\.com/i },
        { name:'Webflow',         p:/webflow\.com|webflow\.js/i },
        { name:'Framer',          p:/framer\.com|framerusercontent/i },
        { name:'Google Analytics',p:/google-analytics\.com|gtag\(|ga\('send/i },
        { name:'Google Tag Manager',p:/googletagmanager\.com/i },
        { name:'Cloudflare',      p:/cloudflare|__cf_bm/i },
        { name:'Stripe',          p:/stripe\.com\/v3|Stripe\(/i },
        { name:'Intercom',        p:/intercom\.io|window\.Intercom/i },
        { name:'HubSpot',         p:/hubspot\.com|hs-scripts/i },
        { name:'Hotjar',          p:/hotjar\.com|hjSetting/i },
        { name:'Vercel',          p:/vercel\.app|_vercel/i },
        { name:'Netlify',         p:/netlify\.app|netlify\.com/i },
        { name:'Font Awesome',    p:/font-awesome|fontawesome/i },
        { name:'GSAP',            p:/gsap(?:\.min)?\.js|TweenMax/i },
        { name:'Webpack',         p:/__webpack_require__/i },
        { name:'Vite',            p:/@vite\/client|vite\/client/i },
        { name:'Alpine.js',       p:/alpine(?:\.min)?\.js|x-data=/i },
        { name:'Astro',           p:/astro-island|astro\.build/i },
    ],

    analyze(doc, html) {
        const detected = this.sigs.filter(s => s.p.test(html)).map(s => s.name);
        const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
        if (generator) detected.push(generator);
        const scripts = [...doc.querySelectorAll('script[src]')];
        return {
            detected: [...new Set(detected)],
            scriptsCount: scripts.length,
            scriptSrcs: scripts.map(s => s.getAttribute('src')).filter(Boolean).slice(0,12),
            generator
        };
    }
};
