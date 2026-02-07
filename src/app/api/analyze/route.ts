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

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
    console.log('API Key configured:', apiKey ? 'YES' : 'NO')
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      console.error('No API key found in environment variables')
      return NextResponse.json({
        error: 'API key not configured',
        message: 'Please add GOOGLE_PAGESPEED_API_KEY to your environment variables',
        isDemo: true
      }, { status: 500 })
    }

    // Initialize PageSpeed API with explicit key
    const pageSpeedAPI = new PageSpeedAPI(apiKey)
    console.log('Analyzing URL:', url)

    try {
      // Get real analysis data
      const analysisResult = await pageSpeedAPI.getFullAnalysis(url)
      console.log('Analysis successful for:', url)
      return NextResponse.json(analysisResult)
    } catch (apiError: any) {
      console.error('PageSpeed API error details:', {
        message: apiError.message,
        stack: apiError.stack,
        url: url
      })
      
      // Return error instead of fallback
      return NextResponse.json({
        error: 'PageSpeed API request failed',
        details: apiError.message,
        url: url,
        isDemo: true
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}