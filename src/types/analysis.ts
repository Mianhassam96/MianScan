export interface PerformanceMetrics {
  score: number
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  mobileScore: number
  desktopScore: number
  issues: Issue[]
}

export interface SEOMetrics {
  score: number
  title: {
    exists: boolean
    length: number
    issue?: string
  }
  metaDescription: {
    exists: boolean
    length: number
    issue?: string
  }
  h1Tags: {
    count: number
    issue?: string
  }
  brokenLinks: number
  sitemap: boolean
  robotsTxt: boolean
  imagesWithoutAlt: number
  issues: Issue[]
}

export interface AccessibilityMetrics {
  score: number
  missingAltAttributes: number
  colorContrastIssues: number
  missingAriaLabels: number
  buttonsWithoutNames: number
  headingStructureIssues: number
  issues: Issue[]
}

export interface Issue {
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  impact: string
  solution: string
  priority: 'high' | 'medium' | 'low'
}

export interface AnalysisResult {
  url: string
  timestamp: string
  overallScore: number
  isDemo?: boolean // Flag to indicate if this is demo data
  performance: PerformanceMetrics
  seo: SEOMetrics
  accessibility: AccessibilityMetrics
}

export interface ScanProgress {
  step: number
  totalSteps: number
  currentTask: string
  isComplete: boolean
}