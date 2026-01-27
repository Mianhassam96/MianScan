'use client'

import { motion } from 'framer-motion'
import { getScoreColor } from '@/lib/utils'
import { AnimatedCounter } from '@/components/animated-counter'

interface ScoreCircleProps {
  score: number
  size?: 'small' | 'medium' | 'large'
  showAnimation?: boolean
}

export function ScoreCircle({ score, size = 'medium', showAnimation = true }: ScoreCircleProps) {
  const sizes = {
    small: { container: 'w-16 h-16', text: 'text-sm', stroke: 4, radius: 28 },
    medium: { container: 'w-24 h-24', text: 'text-lg', stroke: 6, radius: 40 },
    large: { container: 'w-32 h-32', text: 'text-2xl', stroke: 8, radius: 56 }
  }

  const { container, text, stroke, radius } = sizes[size]
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 90) return '#10b981' // green-500
    if (score >= 70) return '#f59e0b' // yellow-500
    return '#ef4444' // red-500
  }

  const getGradientId = (score: number) => {
    if (score >= 90) return 'greenGradient'
    if (score >= 70) return 'yellowGradient'
    return 'redGradient'
  }

  return (
    <div className={`${container} relative`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Animated background pulse */}
        {showAnimation && (
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={getColor(score)}
            strokeWidth={1}
            fill="none"
            opacity="0.2"
            className="animate-pulse-ring"
          />
        )}

        {/* Progress circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke={`url(#${getGradientId(score)})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: showAnimation ? strokeDashoffset : circumference - (score / 100) * circumference }}
          transition={{ duration: showAnimation ? 2 : 0, ease: "easeOut", delay: showAnimation ? 0.5 : 0 }}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
          }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {showAnimation ? (
            <AnimatedCounter
              value={score}
              duration={2}
              className={`${text} font-bold ${getScoreColor(score)}`}
            />
          ) : (
            <span className={`${text} font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            /100
          </div>
        </div>
      </div>

      {/* Glow effect */}
      {showAnimation && (
        <div 
          className={`absolute inset-0 rounded-full opacity-20 blur-xl ${
            score >= 90 ? 'bg-green-500' :
            score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
    </div>
  )
}