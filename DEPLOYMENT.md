# MianScan Deployment Guide

## 🚀 Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MianScan website analyzer"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to your project
   - Navigate to "Settings" → "Domains"
   - Add your custom domain

## 🌐 Alternative Deployment Options

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify
3. Configure redirects for SPA routing

### GitHub Pages
1. Add to `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   module.exports = nextConfig
   ```
2. Run: `npm run build`
3. Deploy the `out` folder

### Docker Deployment
1. Create `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t mianscan .
   docker run -p 3000:3000 mianscan
   ```

## 🔧 Environment Variables

For production deployment, you may want to add:

```env
# .env.local
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_PAGESPEED_API_KEY=your-api-key-here
```

## 📊 Performance Optimization

- Enable compression in your hosting provider
- Configure CDN for static assets
- Set up proper caching headers
- Monitor Core Web Vitals

## 🔒 Security Considerations

- Enable HTTPS
- Configure proper CORS headers
- Set up rate limiting for API routes
- Validate all user inputs

---

Your MianScan application is now ready for production! 🎉