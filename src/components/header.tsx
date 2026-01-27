'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Zap, Crown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface HeaderProps {
  showUpgrade?: boolean
  onUpgrade?: () => void
  onLogoClick?: () => void
}

export function Header({ showUpgrade = false, onUpgrade, onLogoClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <motion.button 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={onLogoClick}
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-lg flex items-center justify-center shadow-glow"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground hover:text-gradient-primary transition-all duration-300">
                MianScan
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                by MultiMian
              </p>
            </div>
          </div>
        </motion.button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <motion.a 
            href="#features" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            whileHover={{ scale: 1.05 }}
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </motion.a>
          <motion.a 
            href="#pricing" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            whileHover={{ scale: 1.05 }}
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </motion.a>
          <motion.a 
            href="#about" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            whileHover={{ scale: 1.05 }}
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </motion.a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showUpgrade && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                onClick={onUpgrade}
                className="btn-gradient hidden sm:flex items-center gap-2"
                size="sm"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </motion.div>
          )}
          
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <motion.a 
                href="#features" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#pricing" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
              >
                Pricing
              </motion.a>
              <motion.a 
                href="#about" 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
              >
                About
              </motion.a>
              {showUpgrade && (
                <Button 
                  onClick={() => {
                    onUpgrade?.()
                    setIsMenuOpen(false)
                  }}
                  className="btn-gradient w-full"
                  size="sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}