'use client'

import { Moon, Sun, Sparkles, Zap } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="relative">
      <motion.button
        onClick={toggleTheme}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group h-14 w-14 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5 shadow-lg hover:shadow-2xl transition-all duration-500 focus-ring overflow-hidden"
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
      >
        {/* Animated background layers */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            background: [
              'linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b)',
              'linear-gradient(135deg, #f59e0b, #8b5cf6, #ec4899)',
              'linear-gradient(225deg, #ec4899, #f59e0b, #8b5cf6)',
              'linear-gradient(315deg, #8b5cf6, #ec4899, #f59e0b)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Morphing background */}
        <motion.div
          className="absolute inset-1 bg-background/95 backdrop-blur-sm rounded-2xl overflow-hidden animate-morphing"
          style={{
            background: theme === 'dark' 
              ? 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.1), transparent 50%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1), transparent 50%)'
              : 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.05), transparent 50%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.05), transparent 50%)'
          }}
        />
        
        {/* Floating particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 40],
                    y: [0, (Math.random() - 0.5) * 40],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  style={{
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main icon container */}
        <div className="relative h-full w-full flex items-center justify-center z-10">
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -180, opacity: 0, scale: 0.3 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="text-orange-500 relative"
              >
                <Sun className="h-6 w-6" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-6 w-6 text-yellow-400 opacity-60" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 180, opacity: 0, scale: 0.3 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="text-blue-400 relative"
              >
                <Moon className="h-6 w-6" />
                {/* Twinkling stars */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-300 rounded-full"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: `${30 + i * 20}%`,
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.3,
                      repeat: Infinity 
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orbital ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent"
          style={{
            background: 'linear-gradient(45deg, transparent, transparent)',
            backgroundImage: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #f59e0b, #06b6d4, #8b5cf6)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: '2px',
            opacity: isHovered ? 1 : 0,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          animate={{
            scale: isHovered ? [1, 1.3, 1] : 1,
            opacity: isHovered ? [0.3, 0.6, 0.3] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Enhanced tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl whitespace-nowrap z-50 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </motion.div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}