import { NextRequest, NextResponse } from 'next/server'
import { PageSpeedAPI } from '@/lib/pagespeed-api'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Initialize PageSpeed API
    const pageSpeedAPI = new PageSpeedAPI()

    try {
      // Get real analysis data
      const analysisResult = await pageSpeedAPI.getFullAnalysis(url)
      return NextResponse.json(analysisResult)
    } catch (apiError: any) {
      console.error('PageSpeed API error:', apiError)
      
      // If API fails, return fallback mock data with a warning
      const fallbackResult = {
        url,
        timestamp: new Date().toISOString(),
        overallScore: 75,
        isDemo: true, // Flag to indicate this is demo data
        performance: {
          score: 78,
          pageLoadTime: 2.3,
          firstContentfulPaint: 1.2,
          largestContentfulPaint: 2.8,
          mobileScore: 75,
          desktopScore: 82,
          issues: [
            {
              type: 'warning' as const,
              title: 'Demo Mode Active',
              description: 'This is sample data. Configure Google PageSpeed API for real analysis.',
              impact: 'Real data requires API key configuration',
              solution: 'Add GOOGLE_PAGESPEED_API_KEY to your environment variables',
              priority: 'high' as const
            }
          ]
        },
        seo: {
          score: 85,
          title: { exists: true, length: 45 },
          metaDescription: { exists: false, length: 0, issue: 'Missing meta description' },
          h1Tags: { count: 1 },
          brokenLinks: 2,
          sitemap: true,
          robotsTxt: false,
          imagesWithoutAlt: 5,
          issues: [
            {
              type: 'info' as const,
              title: 'Demo Data',
              description: 'This is sample SEO data for demonstration.',
              impact: 'Real SEO analysis requires API configuration',
              solution: 'Set up Google PageSpeed Insights API key',
              priority: 'medium' as const
            }
          ]
        },
        accessibility: {
          score: 72,
          missingAltAttributes: 5,
          colorContrastIssues: 3,
          missingAriaLabels: 2,
          buttonsWithoutNames: 1,
          headingStructureIssues: 1,
          issues: [
            {
              type: 'info' as const,
              title: 'Demo Data',
              description: 'This is sample accessibility data for demonstration.',
              impact: 'Real accessibility analysis requires API configuration',
              solution: 'Configure Google PageSpeed Insights API for real data',
              priority: 'medium' as const
            }
          ]
        }
      }

      return NextResponse.json(fallbackResult)
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}