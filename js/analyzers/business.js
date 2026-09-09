/**
 * BusinessAnalyzer — MianScan v2.3
 *
 * Checks how well a website communicates its business identity
 * and readiness to convert visitors into customers.
 *
 * This is the layer that makes MianScan useful to business owners,
 * not just developers and SEO professionals.
 *
 * Checks:
 *   – Clear business/brand name
 *   – Service or product description
 *   – Contact information (email, phone, WhatsApp, form)
 *   – Physical location / address signals
 *   – Business hours
 *   – About / team page
 *   – Testimonials and reviews
 *   – Client logos or social proof numbers
 *   – Case studies or portfolio
 *   – Pricing transparency
 *   – FAQ section
 *   – Privacy policy and terms
 *   – Organization schema markup
 *   – LocalBusiness schema markup
 *   – Social media presence
 */

const BusinessAnalyzer = {
  analyze(doc, html = '') {
    const fullHtml = html || doc.documentElement.innerHTML;
    const bodyText = (doc.body?.textContent || '').toLowerCase();
    const allLinks = [...doc.querySelectorAll('a[href]')];
    const linkHrefs = allLinks.map(a => (a.getAttribute('href') || '').toLowerCase());

    // ── Brand / Business Identity ─────────────────────────────────────────────
    const hasTitle     = !!(doc.querySelector('title')?.textContent?.trim());
    const hasH1        = doc.querySelectorAll('h1').length > 0;
    const hasLogo      = doc.querySelectorAll('img[alt*="logo" i], [class*="logo"], [id*="logo"]').length > 0;
    const hasBrandName = hasTitle || hasLogo; // brand identity present

    // ── Services / Products described ────────────────────────────────────────
    const serviceKeywords = /service|solution|product|offer|package|plan|feature|platform|software|tool|app|system/i;
    const hasServices = serviceKeywords.test(bodyText) ||
      doc.querySelectorAll('[class*="service"], [class*="product"], [class*="feature"], [id*="service"]').length > 0;

    // ── Contact information ───────────────────────────────────────────────────
    const emailReg   = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}/g;
    const emailCount = (fullHtml.match(emailReg) || [])
      .filter(e => !/(\.png|\.jpg|\.gif|\.svg|sentry|example|test@|noreply)/.test(e)).length;
    const hasEmail   = emailCount > 0;
    const hasPhone   = /(\+?\d[\d\s\-().]{6,}\d)/.test(bodyText);
    const hasWhatsApp = /wa\.me|whatsapp\.com/i.test(fullHtml);
    const hasContactPage = linkHrefs.some(h => /\/(contact|reach|support|get-in-touch|hire)/i.test(h));
    const hasForm    = doc.querySelectorAll('form').length > 0;
    const hasChatWidget = /intercom|crisp|tawk|livechat|drift|hubspot/i.test(fullHtml);
    const contactMethods = [hasEmail, hasPhone, hasWhatsApp, hasContactPage, hasForm, hasChatWidget]
      .filter(Boolean).length;

    // ── Location signals ──────────────────────────────────────────────────────
    const hasAddress  = /\d{1,5}\s[\w\s]{2,20}(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd|lane|ln|drive|dr\.?)/i.test(bodyText);
    const hasCity     = /(?:based in|located in|serving|office in)/i.test(bodyText);
    const hasLocation = hasAddress || hasCity;

    // ── Business hours ────────────────────────────────────────────────────────
    const hasHours = /(?:mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday).*(?:\d{1,2}(?::\d{2})?\s*(?:am|pm)|open|closed)/i.test(bodyText) ||
      /business hours|opening hours|office hours/i.test(bodyText);

    // ── About / Team ──────────────────────────────────────────────────────────
    const hasAboutPage = linkHrefs.some(h => /\/about|\/team|\/company|\/us\b/i.test(h));
    const hasAboutSection = /about us|our team|who we are|meet the team|our story|founded/i.test(bodyText) ||
      doc.querySelectorAll('[class*="about"], [id*="about"], [class*="team"], [id*="team"]').length > 0;
    const hasAbout = hasAboutPage || hasAboutSection;

    // ── Social proof ──────────────────────────────────────────────────────────
    const hasTestimonials = /testimonial|review|feedback|what (?:our|clients|customers) say|client said/i.test(fullHtml) ||
      doc.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="rating"]').length > 0;

    const hasClientLogos = /our clients|trusted by|clients include|our partners|worked with/i.test(bodyText) ||
      doc.querySelectorAll('[class*="client"], [class*="partner"], [class*="logo-grid"]').length > 0;

    const hasSocialNumbers = /(\d[\d,]* (?:customers|users|clients|companies|businesses|teams|projects)|trusted by \d|\d+ (?:reviews|ratings|stars))/i.test(bodyText);

    const hasCaseStudies = /case stud|portfolio|our work|projects|success stor/i.test(bodyText) ||
      linkHrefs.some(h => /\/portfolio|\/work|\/case-stud|\/projects/i.test(h));

    // ── Pricing ───────────────────────────────────────────────────────────────
    const hasPricing = /pricing|our plans|see plans|starting (?:at|from|price)|\$\d|£\d|€\d|per month|\/mo\b|\/month\b/i.test(bodyText) ||
      doc.querySelectorAll('[class*="pricing"], [id*="pricing"], [class*="plan"]').length > 0;

    // ── FAQ ───────────────────────────────────────────────────────────────────
    const hasFAQ = /\bfaq\b|frequently asked|common questions|you might ask/i.test(bodyText) ||
      doc.querySelectorAll('[class*="faq"], [id*="faq"]').length > 0;

    // ── Legal pages ───────────────────────────────────────────────────────────
    const hasPrivacy = linkHrefs.some(h => /privacy|gdpr/i.test(h)) ||
      /privacy policy/i.test(bodyText);
    const hasTerms   = linkHrefs.some(h => /terms|tos|legal/i.test(h)) ||
      /terms of (?:service|use)|terms and conditions/i.test(bodyText);

    // ── Schema markup ─────────────────────────────────────────────────────────
    const schemaScripts = [...doc.querySelectorAll('script[type="application/ld+json"]')]
      .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
      .filter(Boolean);

    const schemaTypes = schemaScripts.map(s => s['@type'] || '').filter(Boolean);
    const hasOrgSchema   = schemaTypes.some(t => /organization|localbusiness|business/i.test(t));
    const hasLocalSchema = schemaTypes.some(t => /localbusiness/i.test(t));

    // ── Social media links ────────────────────────────────────────────────────
    const socialPlatforms = {
      LinkedIn:  /linkedin\.com\//i,
      Twitter:   /twitter\.com\/|x\.com\//i,
      Facebook:  /facebook\.com\//i,
      Instagram: /instagram\.com\//i,
      YouTube:   /youtube\.com\//i,
    };
    const socialPresence = Object.entries(socialPlatforms)
      .filter(([, regex]) => regex.test(fullHtml))
      .map(([name]) => name);
    const hasSocial = socialPresence.length > 0;

    // ── Score calculation ─────────────────────────────────────────────────────
    // Weighted: contact (25), identity (20), trust (25), content (15), legal/schema (15)
    let score = 0;

    // Identity (20 pts)
    if (hasBrandName) score += 8;
    if (hasServices)  score += 7;
    if (hasAbout)     score += 5;

    // Contact (25 pts)
    if (hasEmail)       score += 8;
    if (hasPhone)       score += 6;
    if (hasContactPage) score += 6;
    if (hasForm)        score += 5;

    // Trust (25 pts)
    if (hasTestimonials) score += 8;
    if (hasClientLogos)  score += 5;
    if (hasSocialNumbers)score += 4;
    if (hasCaseStudies)  score += 5;
    if (hasSocial)       score += 3;

    // Content (15 pts)
    if (hasPricing) score += 6;
    if (hasFAQ)     score += 5;
    if (hasLocation)score += 4;

    // Legal / Schema (15 pts)
    if (hasPrivacy)     score += 5;
    if (hasTerms)       score += 4;
    if (hasOrgSchema)   score += 4;
    if (hasLocalSchema) score += 2;

    score = Math.min(100, Math.round(score));
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

    // ── Checks list ───────────────────────────────────────────────────────────
    const checks = [
      // Identity
      { section: 'Identity',  type: hasBrandName ? 'ok' : 'warn',  label: 'Brand / Business Name',    msg: hasBrandName ? 'Brand name present in title or logo' : 'No clear brand name detected' },
      { section: 'Identity',  type: hasServices  ? 'ok' : 'warn',  label: 'Services / Products',      msg: hasServices  ? 'Service or product description found' : 'No clear service or product description found' },
      { section: 'Identity',  type: hasAbout     ? 'ok' : 'warn',  label: 'About / Team',             msg: hasAbout     ? 'About or team section detected' : 'No about page or team section found' },

      // Contact
      { section: 'Contact',   type: hasEmail       ? 'ok' : 'warn', label: 'Email Address',           msg: hasEmail       ? `${emailCount} email address(es) found` : 'No email address found' },
      { section: 'Contact',   type: hasPhone       ? 'ok' : 'warn', label: 'Phone Number',            msg: hasPhone       ? 'Phone number detected' : 'No phone number found' },
      { section: 'Contact',   type: hasWhatsApp    ? 'ok' : 'warn', label: 'WhatsApp',                msg: hasWhatsApp    ? 'WhatsApp contact link found' : 'No WhatsApp contact link' },
      { section: 'Contact',   type: hasContactPage ? 'ok' : 'warn', label: 'Contact Page',            msg: hasContactPage ? 'Contact page link found' : 'No contact page detected' },
      { section: 'Contact',   type: hasForm        ? 'ok' : 'warn', label: 'Contact Form',            msg: hasForm        ? 'Contact form detected' : 'No contact form found' },

      // Trust
      { section: 'Trust',     type: hasTestimonials ? 'ok' : 'warn', label: 'Testimonials / Reviews', msg: hasTestimonials ? 'Testimonials or reviews section found' : 'No testimonials or reviews detected' },
      { section: 'Trust',     type: hasClientLogos  ? 'ok' : 'warn', label: 'Client Logos',           msg: hasClientLogos  ? 'Client logos or partner section found' : 'No client logos detected' },
      { section: 'Trust',     type: hasSocialNumbers? 'ok' : 'warn', label: 'Social Proof Numbers',   msg: hasSocialNumbers? 'Quantified social proof detected' : 'No social proof numbers found' },
      { section: 'Trust',     type: hasCaseStudies  ? 'ok' : 'warn', label: 'Case Studies / Portfolio',msg: hasCaseStudies ? 'Case studies or portfolio found' : 'No case studies or portfolio detected' },

      // Content
      { section: 'Content',   type: hasPricing ? 'ok' : 'warn',   label: 'Pricing Information',      msg: hasPricing ? 'Pricing section or page found' : 'No pricing information detected' },
      { section: 'Content',   type: hasFAQ     ? 'ok' : 'warn',   label: 'FAQ Section',              msg: hasFAQ     ? 'FAQ section found' : 'No FAQ section detected' },
      { section: 'Content',   type: hasLocation? 'ok' : 'warn',   label: 'Location / Area Served',   msg: hasLocation? 'Location or service area mentioned' : 'No location or service area found' },

      // Legal & Schema
      { section: 'Legal',     type: hasPrivacy ? 'ok' : 'warn',   label: 'Privacy Policy',           msg: hasPrivacy ? 'Privacy policy link found' : 'No privacy policy detected' },
      { section: 'Legal',     type: hasTerms   ? 'ok' : 'warn',   label: 'Terms of Service',         msg: hasTerms   ? 'Terms of service link found' : 'No terms of service detected' },
      { section: 'Schema',    type: hasOrgSchema   ? 'ok' : 'warn',label: 'Organization Schema',     msg: hasOrgSchema   ? 'Organization schema markup found' : 'No Organization schema detected' },
      { section: 'Social',    type: hasSocial  ? 'ok' : 'warn',   label: 'Social Media Presence',    msg: hasSocial  ? `Social links found: ${socialPresence.join(', ')}` : 'No social media links found' },
    ];

    return {
      score,
      grade,
      hasBrandName,
      hasServices,
      hasAbout,
      hasEmail,
      hasPhone,
      hasWhatsApp,
      hasContactPage,
      hasForm,
      hasChatWidget,
      contactMethods,
      hasTestimonials,
      hasClientLogos,
      hasSocialNumbers,
      hasCaseStudies,
      hasPricing,
      hasFAQ,
      hasLocation,
      hasHours,
      hasPrivacy,
      hasTerms,
      hasOrgSchema,
      hasLocalSchema,
      hasSocial,
      socialPresence,
      checks,
    };
  }
};
