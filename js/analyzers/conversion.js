/**
 * ConversionAnalyzer — MianScan v2.2
 *
 * Analyses a webpage for conversion-readiness:
 *   – CTA presence, position, and clarity
 *   – Contact accessibility
 *   – Trust signals (testimonials, reviews, logos, pricing)
 *   – Lead-generation elements (forms, newsletters)
 *   – Navigation friction (excessive menus, dead-ends)
 *
 * Returns a score (0–100) and categorised findings.
 */

const ConversionAnalyzer = {
  analyze(doc, html = '') {
    const fullHtml  = html || doc.documentElement.innerHTML;
    const bodyText  = (doc.body?.textContent || '').toLowerCase();
    const allLinks  = [...doc.querySelectorAll('a[href]')];
    const allBtns   = [...doc.querySelectorAll('button, a.btn, a[class*="cta"], [class*="btn"]')];

    // ── CTA analysis ─────────────────────────────────────────────────────────
    const ctaKeywords = /get started|start free|try free|sign up|free trial|get access|join now|start now|create account|get demo|book a call|request a quote|contact us|buy now|order now|subscribe/i;
    const ctaEls = allBtns.concat(allLinks).filter(el => ctaKeywords.test(el.textContent.trim()));

    const hasPrimaryCTA   = ctaEls.length > 0;
    const primaryCTACount = ctaEls.length;
    const ctaCrowded      = primaryCTACount > 8;

    // Check if a CTA appears in first ~25% of the HTML (above-the-fold heuristic)
    const firstQuarter   = fullHtml.slice(0, Math.floor(fullHtml.length * 0.25));
    const ctaAboveFold   = ctaKeywords.test(firstQuarter);

    // ── Contact options ───────────────────────────────────────────────────────
    const emailReg   = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}/g;
    const emailCount = (fullHtml.match(emailReg) || [])
      .filter(e => !/(\.png|\.jpg|\.gif|\.svg|sentry|example|test@)/.test(e)).length;

    const hasPhone     = /(\+?\d[\d\s\-().]{6,}\d)/.test(bodyText);
    const hasWhatsApp  = /wa\.me|whatsapp\.com/i.test(fullHtml);
    const hasContactPg = allLinks.some(a => /\/(contact|reach|support|help)/i.test(a.getAttribute('href') || ''));
    const hasChatWidget = /intercom|crisp|tawk|livechat|drift|hubspot/i.test(fullHtml);

    const contactScore =
      (emailCount > 0 ? 25 : 0) +
      (hasPhone      ? 20 : 0) +
      (hasWhatsApp   ? 15 : 0) +
      (hasContactPg  ? 20 : 0) +
      (hasChatWidget ? 20 : 0);

    // ── Trust signals ─────────────────────────────────────────────────────────
    const hasTestimonials = /testimonial|review|feedback|what (?:our|clients|customers) say/i.test(fullHtml) ||
      doc.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="rating"]').length > 0;

    const hasPricing = /pricing|plans|\/pricing/i.test(fullHtml) ||
      doc.querySelectorAll('[class*="pricing"], [id*="pricing"]').length > 0;

    const hasSocialProof = /(\d[\d,]* (?:customers|users|clients|companies|businesses|teams)|trusted by|used by|rated \d|\d+ reviews)/i.test(bodyText);

    const hasFAQ = /\bfaq\b|frequently asked|common questions/i.test(bodyText) ||
      doc.querySelectorAll('[class*="faq"], [id*="faq"]').length > 0;

    const hasLogo = doc.querySelectorAll('img[alt*="logo" i], .logo, #logo, [class*="logo"]').length > 0;

    const hasBadges = /ssl|secure|certified|verified|award|guarantee|money.back/i.test(bodyText);

    const trustScore =
      (hasTestimonials ? 25 : 0) +
      (hasSocialProof  ? 20 : 0) +
      (hasPricing      ? 15 : 0) +
      (hasFAQ          ? 15 : 0) +
      (hasLogo         ? 10 : 0) +
      (hasBadges       ? 15 : 0);

    // ── Lead-gen elements ─────────────────────────────────────────────────────
    const forms       = [...doc.querySelectorAll('form')];
    const hasForm     = forms.length > 0;
    const hasNewsletterForm = forms.some(f =>
      /newsletter|subscribe|email/i.test(f.innerHTML) ||
      f.querySelector('input[type="email"]')
    );
    const hasLeadCapture = hasForm || hasNewsletterForm ||
      /download|free guide|ebook|whitepaper|cheat sheet/i.test(bodyText);

    // ── Navigation friction ───────────────────────────────────────────────────
    const navLinks = doc.querySelectorAll('nav a, [class*="nav"] a, [class*="menu"] a');
    const navCount = navLinks.length;
    const hasExcessiveNav = navCount > 20;  // over 20 nav links → friction

    // ── Overall conversion score (0–100) ─────────────────────────────────────
    let score = 0;

    // CTA (35 pts)
    if (hasPrimaryCTA)  score += 20;
    if (ctaAboveFold)   score += 10;
    if (!ctaCrowded)    score += 5;

    // Contact (25 pts)
    score += Math.round(contactScore * 0.25);

    // Trust (25 pts)
    score += Math.round(trustScore * 0.25);

    // Lead-gen (10 pts)
    if (hasLeadCapture) score += 5;
    if (hasNewsletterForm) score += 5;

    // Nav friction penalty (−5 pts)
    if (hasExcessiveNav) score = Math.max(0, score - 5);

    score = Math.min(100, Math.round(score));
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

    // ── Checks list (for UI rendering) ───────────────────────────────────────
    const checks = [
      {
        type: hasPrimaryCTA ? 'ok' : 'error',
        label: 'Primary CTA',
        msg: hasPrimaryCTA
          ? `${primaryCTACount} call-to-action element(s) detected`
          : 'No primary CTA found — visitors have no clear next step',
      },
      {
        type: ctaAboveFold ? 'ok' : 'warn',
        label: 'CTA Above the Fold',
        msg: ctaAboveFold
          ? 'CTA visible in the first section of the page'
          : 'CTA may not be visible without scrolling',
      },
      {
        type: ctaCrowded ? 'warn' : 'ok',
        label: 'CTA Clarity',
        msg: ctaCrowded
          ? `${primaryCTACount} CTAs detected — too many competing actions`
          : 'CTA count looks reasonable',
      },
      {
        type: emailCount > 0 ? 'ok' : 'warn',
        label: 'Email Contact',
        msg: emailCount > 0 ? `${emailCount} email address(es) found` : 'No email address found on page',
      },
      {
        type: hasPhone ? 'ok' : 'warn',
        label: 'Phone Number',
        msg: hasPhone ? 'Phone number found on page' : 'No phone number found',
      },
      {
        type: hasContactPg ? 'ok' : 'warn',
        label: 'Contact Page',
        msg: hasContactPg ? 'Link to a contact/support page found' : 'No contact page link found',
      },
      {
        type: hasTestimonials ? 'ok' : 'warn',
        label: 'Testimonials / Reviews',
        msg: hasTestimonials ? 'Testimonials or reviews section detected' : 'No testimonials or reviews found',
      },
      {
        type: hasSocialProof ? 'ok' : 'warn',
        label: 'Social Proof',
        msg: hasSocialProof ? 'Social proof signals detected (user counts, ratings)' : 'No quantified social proof found',
      },
      {
        type: hasPricing ? 'ok' : 'warn',
        label: 'Pricing Transparency',
        msg: hasPricing ? 'Pricing section or page found' : 'No pricing information detected',
      },
      {
        type: hasLeadCapture ? 'ok' : 'warn',
        label: 'Lead Capture',
        msg: hasLeadCapture
          ? `Lead capture element found${hasNewsletterForm ? ' (newsletter/email form)' : ''}`
          : 'No lead-capture form or opt-in found',
      },
      {
        type: hasExcessiveNav ? 'warn' : 'ok',
        label: 'Navigation Clarity',
        msg: hasExcessiveNav
          ? `${navCount} navigation links — may overwhelm visitors`
          : `${navCount} navigation link(s) — looks clean`,
      },
    ];

    return {
      score,
      grade,
      trustScore: Math.round(trustScore),
      contactScore: Math.round(contactScore),
      hasPrimaryCTA,
      ctaAboveFold,
      ctaCrowded,
      hasTestimonials,
      hasSocialProof,
      hasPricing,
      hasForm,
      hasNewsletterForm,
      hasLeadCapture,
      hasExcessiveNav,
      navCount,
      checks,
    };
  }
};
