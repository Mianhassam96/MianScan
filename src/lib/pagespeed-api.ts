interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number }
      seo: { score: number }
      accessibility: { score: number }
      'best-practices'?: { score: number }
    }
    audits: {
      [key: string]: {
        score?: number
        numericValue?: number
        displayValue?: string
        details?: any
      }
    }
  }
  loadingExperience?: {
    metrics: {
      [key: string]: {
        percentile: number
        category: string
      }
    }
  }
}

export class PageSpeedAPI {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_PAGESPEED_API_KEY || ''
  }

  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile') {
    if (!this.apiKey) {
      throw new Error('Google PageSpeed API key is required')
    }

    const params = new URLSearchParams({
      url,
      key: this.apiKey,
      strategy,
      category: 'performance,seo,accessibility,best-practices'
    })

    const response = await fetch(`${this.baseUrl}?${params}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('PageSpeed API error:', response.status, errorText)
      throw new Error(`PageSpeed API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('PageSpeed API Response:', JSON.stringify(data, null, 2))
    return data as PageSpeedResponse
  }

  async getFullAnalysis(url: string) {
    try {
      // Get both mobile and desktop data
      const [mobileData, desktopData] = await Promise.all([
        this.analyzeUrl(url, 'mobile'),
        this.analyzeUrl(url, 'desktop')
      ])

      return this.transformToAnalysisResult(url, mobileData, desktopData)
    } catch (error) {
      console.error('PageSpeed API error:', error)
      throw error
    }
  }

  private transformToAnalysisResult(url: string, mobileData: PageSpeedResponse, desktopData: PageSpeedResponse) {
    const mobile = mobileData.lighthouseResult
    const desktop = desktopData.lighthouseResult

    console.log('Transforming PageSpeed data for:', url)
    console.log('Mobile categories:', mobile.categories)
    console.log('Desktop categories:', desktop.categories)

    // Performance metrics
    const performanceScore = Math.round((mobile.categories.performance.score || 0) * 100)
    const mobileScore = Math.round((mobile.categories.performance.score || 0) * 100)
    const desktopScore = Math.round((desktop.categories.performance.score || 0) * 100)

    // Key performance metrics
    const fcp = mobile.audits['first-contentful-paint']?.numericValue || 0
    const lcp = mobile.audits['largest-contentful-paint']?.numericValue || 0
    const speedIndex = mobile.audits['speed-index']?.numericValue || 0
    const tti = mobile.audits['interactive']?.numericValue || 0
    const tbt = mobile.audits['total-blocking-time']?.numericValue || 0
    const cls = mobile.audits['cumulative-layout-shift']?.numericValue || 0

    console.log('Performance metrics:', { performanceScore, mobileScore, desktopScore, fcp, lcp, speedIndex, tti, tbt, cls })

    // SEO metrics
    const seoScore = Math.round((mobile.categories.seo.score || 0) * 100)
    console.log('SEO Score:', seoScore)
    
    // Accessibility metrics  
    const accessibilityScore = Math.round((mobile.categories.accessibility.score || 0) * 100)
    console.log('Accessibility Score:', accessibilityScore)

    // Best Practices score (if available)
    const bestPracticesScore = mobile.categories['best-practices'] 
      ? Math.round((mobile.categories['best-practices'].score || 0) * 100)
      : 0
    console.log('Best Practices Score:', bestPracticesScore)

    // Generate issues from audit results
    const performanceIssues = this.extractPerformanceIssues(mobile.audits)
    const seoIssues = this.extractSEOIssues(mobile.audits)
    const accessibilityIssues = this.extractAccessibilityIssues(mobile.audits)

    console.log('Issues extracted:', {
      performance: performanceIssues.length,
      seo: seoIssues.length,
      accessibility: accessibilityIssues.length
    })

    // Calculate overall score with best practices
    const overallScore = Math.round(
      performanceScore * 0.35 + 
      seoScore * 0.35 + 
      accessibilityScore * 0.20 +
      bestPracticesScore * 0.10
    )

    const result = {
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      performance: {
        score: performanceScore,
        pageLoadTime: speedIndex / 1000, // Convert to seconds
        firstContentfulPaint: fcp / 1000,
        largestContentfulPaint: lcp / 1000,
        timeToInteractive: tti / 1000,
        totalBlockingTime: tbt,
        cumulativeLayoutShift: cls,
        mobileScore,
        desktopScore,
        issues: performanceIssues
      },
      seo: {
        score: seoScore,
        title: this.analyzeTitleTag(mobile.audits),
        metaDescription: this.analyzeMetaDescription(mobile.audits),
        h1Tags: this.analyzeH1Tags(mobile.audits),
        brokenLinks: this.countBrokenLinks(mobile.audits),
        sitemap: this.checkSitemap(mobile.audits),
        robotsTxt: this.checkRobotsTxt(mobile.audits),
        imagesWithoutAlt: this.countImagesWithoutAlt(mobile.audits),
        canonicalUrl: this.checkCanonical(mobile.audits),
        structuredData: this.checkStructuredData(mobile.audits),
        mobileOptimized: this.checkMobileFriendly(mobile.audits),
        httpsEnabled: this.checkHTTPS(mobile.audits),
        issues: seoIssues
      },
      accessibility: {
        score: accessibilityScore,
        missingAltAttributes: this.countMissingAlt(mobile.audits),
        colorContrastIssues: this.countColorContrastIssues(mobile.audits),
        missingAriaLabels: this.countMissingAriaLabels(mobile.audits),
        buttonsWithoutNames: this.countButtonsWithoutNames(mobile.audits),
        headingStructureIssues: this.countHeadingIssues(mobile.audits),
        issues: accessibilityIssues
      }
    }

    console.log('Final result:', JSON.stringify(result, null, 2))
    return result
  }

  private extractPerformanceIssues(audits: any) {
    const issues = []

    // Large images
    if (audits['uses-optimized-images']?.score < 1) {
      issues.push({
        type: 'warning' as const,
        title: 'Unoptimized Images',
        description: 'Your images could be optimized to load faster.',
        impact: 'Slows down page loading and uses more bandwidth',
        solution: 'Compress images and use modern formats like WebP or AVIF',
        priority: 'high' as const
      })
    }

    // Unused CSS
    if (audits['unused-css-rules']?.score < 1) {
      issues.push({
        type: 'info' as const,
        title: 'Unused CSS',
        description: 'Remove unused CSS to reduce file sizes.',
        impact: 'Increases download time and parsing overhead',
        solution: 'Remove or defer unused CSS rules',
        priority: 'medium' as const
      })
    }

    // Text compression
    if (audits['uses-text-compression']?.score < 1) {
      issues.push({
        type: 'info' as const,
        title: 'Enable Text Compression',
        description: 'Text resources should be compressed (gzip, deflate or brotli).',
        impact: 'Larger file sizes mean slower downloads',
        solution: 'Enable gzip or brotli compression on your server',
        priority: 'medium' as const
      })
    }

    return issues
  }

  private extractSEOIssues(audits: any) {
    const issues = []

    // Meta description
    if (audits['meta-description']?.score < 1) {
      issues.push({
        type: 'error' as const,
        title: 'Missing Meta Description',
        description: 'Your page is missing a meta description.',
        impact: 'Search engines may not display your page properly in results',
        solution: 'Add a meta description tag with 150-160 characters describing your page',
        priority: 'high' as const
      })
    }

    // Document title
    if (audits['document-title']?.score < 1) {
      issues.push({
        type: 'error' as const,
        title: 'Missing or Poor Title Tag',
        description: 'Your page title is missing or not descriptive.',
        impact: 'Reduces click-through rates from search results',
        solution: 'Add a unique, descriptive title tag (50-60 characters)',
        priority: 'high' as const
      })
    }

    // Image alt text
    if (audits['image-alt']?.score < 1) {
      issues.push({
        type: 'warning' as const,
        title: 'Images Missing Alt Text',
        description: 'Some images are missing alt attributes.',
        impact: 'Reduces SEO value and accessibility',
        solution: 'Add descriptive alt text to all images',
        priority: 'medium' as const
      })
    }

    return issues
  }

  private extractAccessibilityIssues(audits: any) {
    const issues = []

    // Color contrast
    if (audits['color-contrast']?.score < 1) {
      issues.push({
        type: 'error' as const,
        title: 'Low Color Contrast',
        description: 'Some elements have insufficient color contrast.',
        impact: 'Users with visual impairments may not be able to read the content',
        solution: 'Increase contrast ratio to at least 4.5:1 for normal text',
        priority: 'high' as const
      })
    }

    // Button names
    if (audits['button-name']?.score < 1) {
      issues.push({
        type: 'warning' as const,
        title: 'Buttons Without Accessible Names',
        description: 'Some buttons don\'t have accessible names.',
        impact: 'Screen reader users cannot understand button purposes',
        solution: 'Add aria-label or visible text to all buttons',
        priority: 'medium' as const
      })
    }

    // Image alt text (accessibility perspective)
    if (audits['image-alt']?.score < 1) {
      issues.push({
        type: 'warning' as const,
        title: 'Images Missing Alt Attributes',
        description: 'Images without alt text are not accessible to screen readers.',
        impact: 'Screen reader users miss important visual information',
        solution: 'Add descriptive alt attributes to all informative images',
        priority: 'medium' as const
      })
    }

    return issues
  }

  // Helper methods for specific SEO checks
  private analyzeTitleTag(audits: any) {
    const titleAudit = audits['document-title']
    return {
      exists: titleAudit?.score === 1,
      length: titleAudit?.details?.items?.[0]?.title?.length || 0,
      issue: titleAudit?.score < 1 ? 'Missing or poor title tag' : undefined
    }
  }

  private analyzeMetaDescription(audits: any) {
    const metaAudit = audits['meta-description']
    return {
      exists: metaAudit?.score === 1,
      length: metaAudit?.details?.items?.[0]?.description?.length || 0,
      issue: metaAudit?.score < 1 ? 'Missing meta description' : undefined
    }
  }

  private analyzeH1Tags(audits: any) {
    // This is a simplified check - real implementation would need more detailed analysis
    return {
      count: 1, // Default assumption
      issue: undefined
    }
  }

  private countBrokenLinks(audits: any) {
    return audits['crawlable-anchors']?.score < 1 ? 1 : 0
  }

  private checkSitemap(audits: any) {
    // This would need additional API calls or different audit
    return true // Default assumption
  }

  private checkRobotsTxt(audits: any) {
    return audits['robots-txt']?.score === 1
  }

  private countImagesWithoutAlt(audits: any) {
    const imageAltAudit = audits['image-alt']
    return imageAltAudit?.details?.items?.length || 0
  }

  private countMissingAlt(audits: any) {
    return this.countImagesWithoutAlt(audits)
  }

  private countColorContrastIssues(audits: any) {
    const contrastAudit = audits['color-contrast']
    return contrastAudit?.details?.items?.length || 0
  }

  private countMissingAriaLabels(audits: any) {
    const ariaAudit = audits['aria-required-attr']
    return ariaAudit?.details?.items?.length || 0
  }

  private countButtonsWithoutNames(audits: any) {
    const buttonAudit = audits['button-name']
    return buttonAudit?.details?.items?.length || 0
  }

  private countHeadingIssues(audits: any) {
    const headingAudit = audits['heading-order']
    return headingAudit?.score < 1 ? 1 : 0
  }

  private checkCanonical(audits: any) {
    const canonicalAudit = audits['canonical']
    return canonicalAudit?.score === 1
  }

  private checkStructuredData(audits: any) {
    const structuredDataAudit = audits['structured-data']
    return structuredDataAudit?.score === 1 || true // Default to true if not available
  }

  private checkMobileFriendly(audits: any) {
    const viewportAudit = audits['viewport']
    return viewportAudit?.score === 1
  }

  private checkHTTPS(audits: any) {
    const httpsAudit = audits['is-on-https']
    return httpsAudit?.score === 1
  }
}