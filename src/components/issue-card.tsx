'use client'

import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Issue } from '@/types/analysis'
import { motion } from 'framer-motion'

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const getIcon = (type: Issue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  const getBorderColor = (type: Issue['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-6 ${getBorderColor(issue.type)}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon(issue.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{issue.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
              {issue.priority} priority
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                ❌ Problem
              </span>
              <p className="text-gray-600">{issue.description}</p>
            </div>
            
            <div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                💡 Why it matters
              </span>
              <p className="text-gray-600">{issue.impact}</p>
            </div>
            
            <div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                ✅ How to fix it
              </span>
              <p className="text-gray-600">{issue.solution}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}