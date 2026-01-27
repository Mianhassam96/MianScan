'use client'

import { useState } from 'react'
import { LandingPage } from '@/components/landing-page'
import { AnalyzerPage } from '@/components/analyzer-page'
import { ResultsPage } from '@/components/results-page'

type AppState = 'landing' | 'analyzing' | 'results'

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('landing')
  const [currentUrl, setCurrentUrl] = useState('')

  const handleAnalyze = (url: string) => {
    setCurrentUrl(url)
    setCurrentState('analyzing')
  }

  const handleAnalysisComplete = (url: string) => {
    setCurrentUrl(url)
    setCurrentState('results')
  }

  const handleBack = () => {
    setCurrentState('landing')
  }

  const handleNewScan = () => {
    setCurrentState('landing')
    setCurrentUrl('')
  }

  switch (currentState) {
    case 'landing':
      return <LandingPage onAnalyze={handleAnalyze} />
    case 'analyzing':
      return (
        <AnalyzerPage
          url={currentUrl}
          onBack={handleBack}
          onComplete={handleAnalysisComplete}
        />
      )
    case 'results':
      return (
        <ResultsPage
          url={currentUrl}
          onBack={handleBack}
          onNewScan={handleNewScan}
        />
      )
    default:
      return <LandingPage onAnalyze={handleAnalyze} />
  }
}