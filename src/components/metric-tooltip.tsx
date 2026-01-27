'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface MetricTooltipProps {
  title: string
  description: string
  children: React.ReactNode
}

export function MetricTooltip({ title, description, children }: MetricTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
        <Info className="inline-block h-4 w-4 ml-1 text-gray-400" />
      </div>
      
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-full ml-2">
          <div className="font-medium mb-1">{title}</div>
          <div className="text-gray-300">{description}</div>
          {/* Arrow */}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  )
}