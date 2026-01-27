# MianScan

**Website Performance, SEO & Accessibility Analyzer**

*Website health made simple.*

## 🎯 Project Overview

MianScan is a modern, stylish web application that analyzes any website URL and provides clear, actionable insights about performance, SEO, and accessibility. Built with a unique design system and premium user experience that rivals professional SaaS tools.

## ✨ Key Features

### 🔍 Comprehensive Analysis
- **Performance Analysis**: Core Web Vitals, page load times, mobile & desktop optimization
- **SEO Analysis**: Meta tags, headings, structured data, technical SEO issues
- **Accessibility Analysis**: WCAG compliance, color contrast, ARIA labels, keyboard navigation

### 🎨 Premium Design System
- **Unique Theme**: Modern gradient-based design with glass morphism effects
- **Dark/Light Mode**: Smooth theme transitions with enhanced toggle animation
- **Advanced Animations**: Floating elements, morphing shapes, particle effects
- **Glass Morphism**: Backdrop blur effects throughout the interface
- **Gradient Mesh**: Dynamic background patterns and color schemes

### 🚀 Modern User Experience
- **Animated Counters**: Score numbers count up from 0 with spring animations
- **Interactive Elements**: Hover effects, micro-interactions, and smooth transitions
- **Mobile-First**: Responsive design optimized for all devices
- **Loading States**: Professional skeleton loaders with shimmer effects
- **Toast Notifications**: Success/error feedback with animations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives for accessibility
- **Animations**: Framer Motion for advanced animations
- **Icons**: Lucide React icon library
- **API**: Google PageSpeed Insights integration

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd mianscan
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

> **Demo Mode**: The app works immediately with realistic sample data. For real analysis, configure the Google PageSpeed API key in `.env.local`.

## 🎨 Design Highlights

### Color System
- **Primary Gradient**: Purple to Pink to Orange (`#8B5CF6` → `#EC4899` → `#F59E0B`)
- **Secondary Gradient**: Cyan to Blue to Purple (`#06B6D4` → `#3B82F6` → `#8B5CF6`)
- **Mesh Background**: Multi-point radial gradients for depth
- **Glass Effects**: Semi-transparent overlays with backdrop blur

### Animation System
- **Floating Elements**: Gentle Y-axis movement with easing
- **Morphing Shapes**: CSS-based shape transformations
- **Particle Effects**: Floating particles on hover interactions
- **Gradient Shifts**: Animated gradient backgrounds
- **Theme Transitions**: Smooth 300ms transitions between light/dark modes

### Typography
- **Font**: Inter with optimized font features
- **Gradient Text**: Animated gradient text effects
- **Hierarchy**: Clear visual hierarchy with proper contrast

## 🔧 API Configuration

### Google PageSpeed Insights (Optional)
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable PageSpeed Insights API
3. Add to `.env.local`:
   ```
   GOOGLE_PAGESPEED_API_KEY=your_api_key_here
   ```

Without API key, the app shows demo data with upgrade prompts.

## 📁 Project Structure

```
mianscan/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Main app state management
│   │   ├── globals.css         # Enhanced CSS with animations
│   │   └── api/analyze/        # API route for website analysis
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── landing-page.tsx    # Enhanced hero and features
│   │   ├── theme-toggle.tsx    # Advanced theme switcher
│   │   ├── analyzer-page.tsx   # Analysis progress page
│   │   ├── results-page.tsx    # Results dashboard
│   │   └── *.tsx              # Other components
│   ├── lib/
│   │   ├── pagespeed-api.ts    # Google PageSpeed API integration
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── analysis.ts         # TypeScript definitions
├── package.json
└── README.md
```

## 🎯 What Makes This Unique

### Design Innovation
- **Gradient Mesh Backgrounds**: Multi-layered radial gradients
- **Advanced Glass Morphism**: Backdrop blur with subtle borders
- **Morphing Animations**: CSS-based shape transformations
- **Particle Systems**: Interactive floating elements
- **Theme System**: Comprehensive dark/light mode support

### User Experience
- **Zero Configuration**: Works immediately with demo data
- **Progressive Enhancement**: Real API integration when configured
- **Accessibility First**: WCAG compliant with proper focus management
- **Performance Optimized**: Efficient animations and lazy loading

### Technical Excellence
- **Type Safety**: Full TypeScript coverage
- **Modern React**: Latest Next.js patterns and hooks
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Proper meta tags and structure

## 🌟 Live Demo

The application is production-ready and can be deployed to:
- **Vercel**: Optimized for Next.js deployment
- **Netlify**: Static site generation support
- **Any hosting**: Standard Node.js application

## 🔮 Future Enhancements

- [ ] PDF report generation
- [ ] Historical tracking
- [ ] Competitor analysis
- [ ] Team collaboration
- [ ] API integrations
- [ ] White-label solutions

## 📄 License

This project is created for demonstration and portfolio purposes.

---

**Built with ❤️ by MultiMian** - *Website health made simple.*