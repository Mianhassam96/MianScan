# 🧪 MianScan API Testing Guide

## 🎯 **API Functionality Verification**

Your MianScan is designed to work in two modes:

### **1. Demo Mode (Default)**
- ✅ **No API key required**
- ✅ **Realistic sample data**
- ✅ **Perfect for showcasing**
- ✅ **Instant functionality**

### **2. Real API Mode (With Google API Key)**
- ✅ **Live website analysis**
- ✅ **Real Google PageSpeed data**
- ✅ **Actual performance metrics**
- ✅ **Professional functionality**

## 🔍 **How to Test Both Modes**

### **Testing Demo Mode (Current Setup)**

1. **Start your server**:
   ```bash
   npm run dev
   ```

2. **Visit**: http://localhost:3001

3. **Test analysis**:
   - Enter any URL (e.g., `https://google.com`)
   - Click "Analyze Website"
   - You'll see demo data with `isDemo: true`

4. **Expected demo response**:
   ```json
   {
     "url": "https://google.com",
     "timestamp": "2026-01-27T...",
     "overallScore": 75,
     "isDemo": true,
     "performance": {
       "score": 78,
       "issues": [
         {
           "title": "Demo Mode Active",
           "description": "This is sample data..."
         }
       ]
     }
   }
   ```

### **Testing Real API Mode**

1. **Get Google PageSpeed API Key**:
   - Visit: https://console.cloud.google.com/
   - Enable PageSpeed Insights API
   - Create API Key

2. **Configure environment**:
   ```bash
   # Edit .env.local
   GOOGLE_PAGESPEED_API_KEY=your_actual_api_key_here
   ```

3. **Restart server**:
   ```bash
   npm run dev
   ```

4. **Test with real data**:
   - Enter any URL (e.g., `https://google.com`)
   - Click "Analyze Website"
   - You'll get real Google data with `isDemo: false`

5. **Expected real response**:
   ```json
   {
     "url": "https://google.com",
     "timestamp": "2026-01-27T...",
     "overallScore": 95,
     "isDemo": false,
     "performance": {
       "score": 100,
       "pageLoadTime": 0.8,
       "firstContentfulPaint": 0.6,
       "issues": [
         // Real issues from Google's analysis
       ]
     }
   }
   ```

## 🧪 **API Endpoint Testing**

### **Direct API Test (Demo Mode)**
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

### **PowerShell Test**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/analyze" -Method POST -ContentType "application/json" -Body '{"url":"https://google.com"}'
```

## 🔧 **Troubleshooting**

### **Demo Mode Issues**
- ✅ Should always work without configuration
- ✅ Returns `isDemo: true` in response
- ✅ Shows "Demo Mode Active" in issues

### **Real API Mode Issues**

**"API key is required" Error**:
- ✅ Check `.env.local` file exists
- ✅ Verify API key is uncommented
- ✅ Restart development server
- ✅ Check API key is valid

**"PageSpeed API error" Messages**:
- ✅ Verify API is enabled in Google Cloud
- ✅ Check API key permissions
- ✅ Ensure URL is publicly accessible
- ✅ Check rate limits (25,000/day free)

**Still getting demo data**:
- ✅ API falls back to demo on any error
- ✅ Check browser console for error messages
- ✅ Verify environment variable name is correct
- ✅ Test API key with Google's API Explorer

## 📊 **Data Comparison**

### **Demo Data Characteristics**:
- ✅ Consistent scores (Performance: 78, SEO: 85, Accessibility: 72)
- ✅ Same results for all URLs
- ✅ "Demo Mode Active" warnings
- ✅ `isDemo: true` flag

### **Real Data Characteristics**:
- ✅ Variable scores based on actual website
- ✅ Different results for different URLs
- ✅ Real Google Lighthouse issues
- ✅ `isDemo: false` flag
- ✅ Actual Core Web Vitals metrics

## 🚀 **Production Deployment**

### **Demo Mode Deployment**:
- ✅ Works immediately on any platform
- ✅ No environment variables needed
- ✅ Perfect for portfolio showcase
- ✅ Demonstrates full functionality

### **Real API Deployment**:
- ✅ Add API key to hosting platform
- ✅ Vercel: `vercel env add GOOGLE_PAGESPEED_API_KEY`
- ✅ Netlify: Environment variables in dashboard
- ✅ Other platforms: Add environment variable

## 🎯 **Verification Checklist**

### **✅ Demo Mode Working**:
- [ ] Server starts without errors
- [ ] Can analyze any URL
- [ ] Returns demo data with `isDemo: true`
- [ ] Shows "Demo Mode Active" warnings
- [ ] UI displays results correctly

### **✅ Real API Mode Working**:
- [ ] API key configured in `.env.local`
- [ ] Server restarts successfully
- [ ] Returns real data with `isDemo: false`
- [ ] Different results for different URLs
- [ ] No "Demo Mode Active" warnings

## 💡 **Pro Tips**

### **Development**:
- Start with demo mode for UI development
- Add real API when ready for testing
- Use demo mode for screenshots and demos
- Switch to real API for client presentations

### **Production**:
- Demo mode for portfolio showcase
- Real API for professional use
- Monitor API usage in Google Cloud
- Implement caching for high traffic

---

**Your MianScan is designed to work perfectly in both modes! 🚀**