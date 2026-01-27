'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, Crown, Zap, Building } from 'lucide-react'
import { motion } from 'framer-motion'

interface PricingProps {
  onUpgrade?: (plan: string) => void
}

export function Pricing({ onUpgrade }: PricingProps) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out MianScan',
      icon: <Zap className="h-6 w-6" />,
      features: [
        '5 scans per day',
        'Basic performance analysis',
        'SEO fundamentals',
        'Accessibility basics',
        'Community support'
      ],
      limitations: [
        'No PDF exports',
        'No scan history',
        'Limited detailed insights'
      ],
      cta: 'Get Started',
      popular: false,
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For serious website optimization',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Unlimited scans',
        'Complete performance analysis',
        'Advanced SEO insights',
        'Full accessibility audit',
        'PDF report exports',
        'Scan history & trends',
        'Mobile vs Desktop comparison',
        'Priority API access',
        'Email support'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      popular: true,
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      name: 'Agency',
      price: '$49',
      period: 'per month',
      description: 'For agencies and teams',
      icon: <Building className="h-6 w-6" />,
      features: [
        'Everything in Pro',
        'White-label reports',
        'Client report branding',
        'Bulk scan operations',
        'Competitor comparison',
        'Team collaboration',
        'Custom domain reports',
        'API access',
        'Priority support'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-emerald-600 to-teal-600'
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-gradient-mesh relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
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
              <Crown className="h-5 w-5" />
            </motion.div>
            Flexible Pricing Plans
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-foreground mb-6"
          >
            Choose Your{' '}
            <span className="text-gradient-hero animate-gradient">Perfect Plan</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Choose the perfect plan for your website optimization needs. 
            Upgrade or downgrade at any time with our flexible billing.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
              className="relative group"
            >
              <motion.div
                className={`
                  glass-card p-8 h-full relative overflow-hidden transition-all duration-500
                  ${plan.popular ? 'ring-2 ring-primary/50 scale-105' : ''}
                `}
                whileHover={{ y: -10, scale: plan.popular ? 1.05 : 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  >
                    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-glow animate-pulse-ring">
                      ⭐ Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
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

                <div className="text-center mb-8 relative z-10">
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r ${plan.gradient} text-white mb-6 shadow-glow`}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 360,
                      boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)"
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {plan.icon}
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <motion.span 
                      className="text-5xl font-bold text-foreground"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {plan.price}
                    </motion.span>
                    <span className="text-muted-foreground text-lg">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIndex * 0.1 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <motion.div 
                      key={limitIndex} 
                      className="flex items-center gap-3 opacity-60"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 0.6, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (plan.features.length + limitIndex) * 0.1 }}
                    >
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground line-through">{limitation}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10"
                >
                  <Button
                    onClick={() => onUpgrade?.(plan.name.toLowerCase())}
                    className={`
                      w-full h-14 font-semibold text-lg transition-all duration-300
                      ${plan.popular 
                        ? `btn-gradient shadow-glow hover:shadow-xl` 
                        : 'btn-modern hover:shadow-lg'
                      }
                    `}
                  >
                    <motion.span
                      animate={plan.popular ? { x: [0, 2, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {plan.cta}
                    </motion.span>
                  </Button>
                </motion.div>

                {/* Hover effect particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary rounded-full"
                      style={{
                        top: `${20 + i * 12}%`,
                        left: `${15 + i * 15}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <p className="text-muted-foreground mb-6 text-lg">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <motion.div 
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money back guarantee</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No setup fees</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}