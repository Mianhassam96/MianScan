# 🚀 MianScan - Website Performance Analyzer

A modern, professional SaaS application for analyzing website performance, SEO, and accessibility using Google PageSpeed Insights API.

## ✨ Features

- **Performance Analysis** - Real-time Core Web Vitals, page load times, and optimization recommendations
- **SEO Audit** - Comprehensive SEO analysis including meta tags, structured data, and mobile optimization
- **Accessibility Check** - WCAG compliance testing with detailed accessibility reports
- **Modern UI/UX** - Beautiful gradient design with glass morphism effects and smooth animations
- **Dark/Light Mode** - Seamless theme switching with particle effects
- **Mobile Responsive** - Perfect experience on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **API**: Google PageSpeed Insights API v5

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Google PageSpeed Insights API key (optional for demo mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mianhassam96/MianScan.git

# Navigate to project directory
cd MianScan

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔑 API Configuration

### Get Google PageSpeed API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "PageSpeed Insights API"
4. Create credentials (API Key)
5. Copy your API key

### Add API Key

Create a `.env.local` file in the root directory:

```env
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

**Note**: The app works in demo mode without an API key, showing sample data.

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mianhassam96/MianScan)

1. Click the button above or go to [Vercel](https://vercel.com)
2. Import your repository
3. Add environment variable: `GOOGLE_PAGESPEED_API_KEY`
4. Deploy

## 🎨 Features Showcase

### Performance Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index

### SEO Analysis
- Title tag optimization
- Meta description analysis
- Heading structure
- Image alt attributes
- Canonical URLs
- Structured data
- Mobile optimization
- HTTPS verification

### Accessibility Audit
- Color contrast ratios
- ARIA labels
- Button accessibility
- Heading order
- Form labels
- Keyboard navigation

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**MultiMian**

- GitHub: [@Mianhassam96](https://github.com/Mianhassam96)

## 🙏 Acknowledgments

- Google PageSpeed Insights API
- Next.js Team
- Vercel
- Open source community

---

**Made with ❤️ by MultiMian**
