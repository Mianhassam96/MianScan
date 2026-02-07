'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Zap, Shield, TrendingUp, CheckCircle, Star, Users, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Pricing } from '@/components/pricing'

interface LandingPageProps {
  onAnalyze: (url: string) => void
}

export function LandingPage({ onAnalyze }: LandingPageProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
    }
  }

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Performance Analysis",
      description: "Get detailed insights about your website's loading speed, Core Web Vitals, and performance metrics that matter for user experience.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "SEO Optimization",
      description: "Discover SEO issues and get actionable recommendations to improve your search engine rankings and visibility.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Accessibility Check",
      description: "Ensure your website is accessible to all users with comprehensive accessibility audits and compliance checks.",
      gradient: "from-emerald-500 to-teal-500"
    }
  ]

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "10,000+", label: "Websites Analyzed" },
    { icon: <Star className="h-6 w-6" />, value: "4.9/5", label: "User Rating" },
    { icon: <Award className="h-6 w-6" />, value: "99.9%", label: "Uptime" }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "MianScan helped me identify critical issues that were hurting my website's performance. My page load time improved by 60%!",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Freelance Developer",
      content: "The detailed reports and simple explanations make it easy to communicate issues to clients. It's become an essential tool in my workflow.",
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Marketing Manager",
      content: "Finally, a tool that explains technical issues in plain English. Our SEO scores have improved significantly since using MianScan.",
      avatar: "LR"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-mesh min-h-screen flex items-center">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-float"
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl animate-float"
            animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-xl animate-float"
            animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 glass-card px-6 py-3 text-primary font-medium mb-8 hover-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-5 w-5" />
                </motion.div>
                Powered by Google PageSpeed Insights
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <motion.span 
                  className="block text-foreground"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Website Health
                </motion.span>
                <motion.span 
                  className="block text-gradient-hero animate-gradient animate-typing"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Made Simple
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Analyze any website's performance, SEO, and accessibility in seconds. 
                Get actionable insights that non-technical users can understand and implement.
              </motion.p>
            </motion.div>

            {/* Enhanced URL Input Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-3xl mx-auto mb-16"
            >
              <div className="glass-card p-4 hover-lift group">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Search className="h-6 w-6" />
                    </motion.div>
                    <Input
                      type="url"
                      placeholder="Enter your website URL (e.g., https://example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-14 h-16 text-lg border-0 bg-transparent focus-visible:ring-0 input-premium text-foreground placeholder:text-muted-foreground/60"
                      required
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="h-16 px-10 btn-gradient font-semibold text-lg shadow-glow"
                    >
                      <motion.span
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Analyze Website
                      </motion.span>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[
                  { icon: CheckCircle, text: "Free analysis" },
                  { icon: CheckCircle, text: "No signup required" },
                  { icon: CheckCircle, text: "Results in 30 seconds" }
                ].map((item, index) => (
                  <motion.span 
                    key={index}
                    className="flex items-center gap-2 glass px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <item.icon className="h-4 w-4 text-green-500" />
                    {item.text}
                  </motion.span>
                ))}
              </motion.div>
            </motion.form>

            {/* Enhanced Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center group"
                  whileHover={{ scale: 1.1, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300,
                    delay: 1.2 + index * 0.1 
                  }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 glass-card mb-3 group-hover:shadow-glow transition-all duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-primary">
                      {stat.icon}
                    </div>
                  </motion.div>
                  <motion.div 
                    className="text-3xl font-bold text-foreground"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 glass-card px-6 py-3 text-primary font-medium mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-5 w-5" />
              </motion.div>
              Comprehensive Analysis
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6"
            >
              Everything You Need to{' '}
              <span className="text-gradient-hero animate-gradient">Optimize</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Comprehensive analysis powered by Google's industry-leading tools, 
              presented in a way that everyone can understand and act upon.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
                className="group relative"
              >
                <motion.div
                  className="glass-card p-8 h-full hover-lift relative overflow-hidden"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    initial={false}
                    animate={{ 
                      background: [
                        `linear-gradient(45deg, transparent, transparent)`,
                        `linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))`,
                        `linear-gradient(45deg, transparent, transparent)`
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <motion.div 
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.gradient} text-white mb-8 shadow-glow`}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 360,
                      boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)"
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-foreground mb-4 group-hover:text-gradient-primary transition-all duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-muted-foreground leading-relaxed"
                    whileHover={{ x: 5 }}
                    transition={{ delay: 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* Hover effect particles */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary rounded-full"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${10 + i * 20}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
        <div className="absolute inset-0 bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-foreground mb-4"
            >
              Loved by Website Owners Worldwide
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              See what our users have to say about MianScan
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6 bg-card/80 backdrop-blur-sm hover-lift group"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-glow">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Optimize Your Website?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of website owners who trust MianScan to keep their sites fast, 
              SEO-friendly, and accessible.
            </p>
            <Button 
              size="lg"
              onClick={() => document.querySelector('input')?.focus()}
              className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-lg font-semibold"
            >
              Start Your Free Analysis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">MianScan</span>
            </div>
            <p className="text-muted-foreground mb-4">Website health made simple.</p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by <span className="font-semibold">MultiMian</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}