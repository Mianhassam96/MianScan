'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Download, RefreshCw, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalysisResult, Issue } from '@/types/analysis'
import { calculateOverallScore, getScoreColor, getScoreBgColor } from '@/lib/utils'
import { ScoreCircle } from '@/components/score-circle'
import { IssueCard } from '@/components/issue-card'
import { MetricTooltip } from '@/components/metric-tooltip'
import { Header } from '@/components/header'
import { ResultsSkeleton } from '@/components/skeleton-loader'

interface ResultsPageProps {
  url: string
  onBack: () => void
  onNewScan: () => void
}

export function ResultsPage({ url, onBack, onNewScan }: ResultsPageProps) {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch analysis results')
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [url])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogoClick={onNewScan} />
        <div className="container mx-auto px-4 py-8">
          <ResultsSkeleton />
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogoClick={onNewScan} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Unable to analyze the website. Please try again.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={onNewScan}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categoryScores = [
    { name: 'Performance', score: results.performance.score, weight: '40%' },
    { name: 'SEO', score: results.seo.score, weight: '40%' },
    { name: 'Accessibility', score: results.accessibility.score, weight: '20%' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header showUpgrade={results.isDemo} onLogoClick={onNewScan} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={onBack} className="hover:text-foreground transition-colors">
            Home
          </button>
          <span>/</span>
          <span>Analysis Results</span>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          {results.isDemo && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Demo Mode Active
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                    You're seeing sample data. To get real analysis results from Google PageSpeed Insights, 
                    configure your API key or upgrade to Pro for instant access.
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      Setup API Key
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overall Score */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-lg border p-8 mb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Website Health Score</h1>
              <p className="text-muted-foreground">Analysis for <span className="font-medium text-foreground">{results.url}</span></p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzed on {new Date(results.timestamp).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Main Score Circle */}
              <div className="flex-shrink-0">
                <ScoreCircle score={results.overallScore} size="large" showAnimation={true} />
              </div>

              {/* Category Breakdown */}
              <div className="flex-1 w-full">
                <h3 className="text-xl font-semibold text-foreground mb-6">Score Breakdown</h3>
                <div className="space-y-6">
                  {categoryScores.map((category, index) => (
                    <motion.div 
                      key={category.name} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="flex items-center gap-6"
                    >
                      <div className="w-28 text-sm font-medium text-foreground">
                        {category.name}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.score}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 + 0.8 }}
                          className={`h-4 rounded-full ${
                            category.score >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            category.score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                        />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-lg font-bold text-foreground">{category.score}</span>
                        <span className="text-sm text-muted-foreground ml-1">/100</span>
                      </div>
                      <div className="w-16 text-xs text-muted-foreground text-right">
                        {category.weight}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8 pt-8 border-t">
              <Button onClick={onNewScan} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Share Results
              </Button>
            </div>
          </motion.div>

          {/* Detailed Results Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-lg border"
          >
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 m-2 rounded-xl">
                <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
                <TabsTrigger value="seo" className="rounded-lg">SEO</TabsTrigger>
                <TabsTrigger value="accessibility" className="rounded-lg">Accessibility</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <ScoreCircle score={results.performance.score} size="medium" showAnimation={false} />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Performance Analysis</h3>
                    <p className="text-muted-foreground">How fast your website loads and responds to user interactions</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors">
                    <MetricTooltip
                      title="Page Load Time"
                      description="The total time it takes for your page to fully load and become interactive."
                    >
                      <div className="text-3xl font-bold text-foreground mb-1">{results.performance.pageLoadTime.toFixed(1)}s</div>
                      <div className="text-sm text-muted-foreground">Page Load Time</div>
                    </MetricTooltip>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors">
                    <MetricTooltip
                      title="First Contentful Paint (FCP)"
                      description="The time when the first text or image is painted on the screen."
                    >
                      <div className="text-3xl font-bold text-foreground mb-1">{results.performance.firstContentfulPaint.toFixed(1)}s</div>
                      <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                    </MetricTooltip>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors">
                    <MetricTooltip
                      title="Mobile Performance"
                      description="Performance score specifically for mobile devices and slower connections."
                    >
                      <div className="text-3xl font-bold text-foreground mb-1">{results.performance.mobileScore}</div>
                      <div className="text-sm text-muted-foreground">Mobile Score</div>
                    </MetricTooltip>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 hover:bg-muted/70 transition-colors">
                    <MetricTooltip
                      title="Desktop Performance"
                      description="Performance score for desktop devices with faster connections."
                    >
                      <div className="text-3xl font-bold text-foreground mb-1">{results.performance.desktopScore}</div>
                      <div className="text-sm text-muted-foreground">Desktop Score</div>
                    </MetricTooltip>
                  </div>
                </div>

                {/* Performance Issues */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-foreground">Issues & Recommendations</h4>
                  {results.performance.issues.length > 0 ? (
                    results.performance.issues.map((issue, index) => (
                      <IssueCard key={index} issue={issue} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Great job! No performance issues found.</p>
                      <p>Your website is performing well.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="seo" className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <ScoreCircle score={results.seo.score} size="medium" showAnimation={false} />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">SEO Analysis</h3>
                    <p className="text-muted-foreground">How well your website is optimized for search engines</p>
                  </div>
                </div>

                {/* SEO Issues */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-foreground">SEO Issues & Recommendations</h4>
                  {results.seo.issues.length > 0 ? (
                    results.seo.issues.map((issue, index) => (
                      <IssueCard key={index} issue={issue} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Excellent SEO! No major issues found.</p>
                      <p>Your website is well-optimized for search engines.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="accessibility" className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <ScoreCircle score={results.accessibility.score} size="medium" showAnimation={false} />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Accessibility Analysis</h3>
                    <p className="text-muted-foreground">How accessible your website is to all users, including those with disabilities</p>
                  </div>
                </div>

                {/* Accessibility Issues */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-foreground">Accessibility Issues & Recommendations</h4>
                  {results.accessibility.issues.length > 0 ? (
                    results.accessibility.issues.map((issue, index) => (
                      <IssueCard key={index} issue={issue} />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Fantastic accessibility! No issues found.</p>
                      <p>Your website is accessible to all users.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}