'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Search, CheckCircle, Clock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScanProgress } from '@/types/analysis'
import { Header } from '@/components/header'
import { useToast } from '@/components/toast'

interface AnalyzerPageProps {
  url: string
  onBack: () => void
  onComplete: (url: string) => void
}

export function AnalyzerPage({ url: initialUrl, onBack, onComplete }: AnalyzerPageProps) {
  const [url, setUrl] = useState(initialUrl)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState<ScanProgress>({
    step: 0,
    totalSteps: 3,
    currentTask: '',
    isComplete: false
  })
  const { addToast } = useToast()

  const scanSteps = [
    { 
      title: 'Checking performance metrics...', 
      description: 'Analyzing page load speed, Core Web Vitals, and performance scores',
      icon: <Zap className="h-5 w-5" />
    },
    { 
      title: 'Analyzing SEO elements...', 
      description: 'Examining meta tags, headings, and search engine optimization',
      icon: <Search className="h-5 w-5" />
    },
    { 
      title: 'Auditing accessibility...', 
      description: 'Checking for accessibility compliance and user experience issues',
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  const startScan = async () => {
    setIsScanning(true)
    setProgress({ step: 0, totalSteps: 3, currentTask: '', isComplete: false })

    try {
      // Step 1: Start analysis
      setProgress({
        step: 1,
        totalSteps: 3,
        currentTask: scanSteps[0].title,
        isComplete: false
      })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 2: SEO analysis
      setProgress({
        step: 2,
        totalSteps: 3,
        currentTask: scanSteps[1].title,
        isComplete: false
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 3: Accessibility audit
      setProgress({
        step: 3,
        totalSteps: 3,
        currentTask: scanSteps[2].title,
        isComplete: false
      })

      // Make actual API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()

      setProgress({
        step: 3,
        totalSteps: 3,
        currentTask: 'Analysis complete!',
        isComplete: true
      })

      addToast({
        type: 'success',
        title: 'Analysis Complete!',
        description: `Successfully analyzed ${url}`,
        duration: 3000
      })

      // Wait a moment then show results
      setTimeout(() => {
        onComplete(url)
      }, 1500)

    } catch (error) {
      console.error('Analysis error:', error)
      setProgress({
        step: 3,
        totalSteps: 3,
        currentTask: 'Analysis failed. Please try again.',
        isComplete: false
      })
      
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        description: 'Unable to analyze the website. Please check the URL and try again.',
        duration: 5000
      })
      
      setIsScanning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      startScan()
    }
  }

  useEffect(() => {
    if (initialUrl) {
      startScan()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header onLogoClick={onBack} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={onBack} className="hover:text-foreground transition-colors">
            Home
          </button>
          <span>/</span>
          <span>Website Analysis</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {!isScanning ? (
            /* URL Input Form */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl shadow-lg border p-8 text-center"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Analyze Your Website
                </h1>
                <p className="text-muted-foreground">
                  Enter your website URL to get comprehensive insights about performance, SEO, and accessibility
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-muted/50 rounded-xl mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-12 h-12 text-lg border-0 bg-background"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    Start Analysis
                  </Button>
                </div>
              </form>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Performance Analysis</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SEO Optimization</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Accessibility Check</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Scanning Progress */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl shadow-lg border p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Analyzing Your Website
                </h2>
                <p className="text-muted-foreground">
                  Scanning: <span className="font-medium text-foreground">{url}</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>Progress</span>
                  <span>{progress.step}/{progress.totalSteps} steps completed</span>
                </div>
                <Progress 
                  value={(progress.step / progress.totalSteps) * 100} 
                  className="h-3 bg-muted"
                />
              </div>

              {/* Current Task */}
              <div className="text-center mb-8">
                <motion.div
                  key={progress.currentTask}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-medium text-foreground"
                >
                  {progress.currentTask}
                </motion.div>
              </div>

              {/* Scanning Steps */}
              <div className="space-y-4">
                {scanSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: progress.step > index ? 1 : 0.5,
                      scale: progress.step === index + 1 ? 1.02 : 1
                    }}
                    className={`flex items-start gap-4 p-6 rounded-xl border transition-all duration-300 ${
                      progress.step > index 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                        : progress.step === index + 1
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      progress.step > index
                        ? 'bg-green-500 text-white'
                        : progress.step === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {progress.step > index ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : progress.step === index + 1 ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${
                        progress.step > index ? 'text-green-800 dark:text-green-200' : 
                        progress.step === index + 1 ? 'text-blue-800 dark:text-blue-200' : 
                        'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        progress.step > index ? 'text-green-600 dark:text-green-300' : 
                        progress.step === index + 1 ? 'text-blue-600 dark:text-blue-300' : 
                        'text-muted-foreground'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {progress.isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-8 p-6 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <div className="text-green-800 dark:text-green-200 text-lg font-medium">
                    Analysis Complete!
                  </div>
                  <div className="text-green-600 dark:text-green-300 text-sm">
                    Preparing your comprehensive website health report...
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}