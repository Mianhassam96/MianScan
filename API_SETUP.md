# 🔑 Google PageSpeed Insights API Setup

## Quick Setup (5 minutes)

### Step 1: Get Your FREE API Key
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: Create a new project or select an existing one
3. **Enable the API**: 
   - Go to "APIs & Services" → "Library"
   - Search for "PageSpeed Insights API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

### Step 2: Configure MianScan
1. **Open `.env.local`** in your project root
2. **Uncomment and update** the API key line:
   ```
   GOOGLE_PAGESPEED_API_KEY=your_actual_api_key_here
   ```
3. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Step 3: Test Real Analysis
1. **Visit your app**: http://localhost:3001
2. **Enter any website URL** (e.g., https://google.com)
3. **Click "Analyze Website"**
4. **Get real data** instead of demo results!

## ✅ Benefits of Real API Key

### With Demo Mode (Current):
- ✅ Full app functionality
- ✅ Realistic sample data
- ✅ Perfect for showcasing
- ❌ Same results every time
- ❌ No real website analysis

### With Real API Key:
- ✅ **Live website analysis**
- ✅ **Real performance metrics**
- ✅ **Actual SEO insights**
- ✅ **True accessibility scores**
- ✅ **Google's official data**
- ✅ **Different results for different sites**

## 🚀 API Key Features

### What You Get:
- **25,000 free requests per day**
- **Real-time website analysis**
- **Google's Lighthouse data**
- **Core Web Vitals metrics**
- **Mobile & Desktop scores**
- **Detailed performance insights**

### Perfect For:
- **Portfolio projects** with real functionality
- **Client presentations** with actual data
- **Website auditing** for real businesses
- **Learning** how websites perform
- **Professional development** projects

## 🔒 Security Notes

### API Key Security:
- ✅ **Environment variables** keep keys secure
- ✅ **Never commit** API keys to version control
- ✅ **Restrict API key** to specific domains in production
- ✅ **Monitor usage** in Google Cloud Console

### Production Deployment:
```bash
# For Vercel deployment
vercel env add GOOGLE_PAGESPEED_API_KEY

# For other platforms, add environment variable:
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

## 🎯 Why Use Real API?

### Demo Mode is Great For:
- Initial development
- UI/UX testing
- Portfolio screenshots
- Demonstrating features

### Real API is Essential For:
- **Actual website analysis**
- **Client work**
- **Production applications**
- **Learning real performance optimization**
- **Building professional tools**

## 🆘 Troubleshooting

### Common Issues:

**"API key not working"**
- ✅ Check API is enabled in Google Cloud
- ✅ Verify API key is correct
- ✅ Restart development server
- ✅ Check browser console for errors

**"Quota exceeded"**
- ✅ Check usage in Google Cloud Console
- ✅ 25,000 requests/day should be plenty
- ✅ Consider implementing caching for production

**"Invalid URL format"**
- ✅ Ensure URLs include http:// or https://
- ✅ Test with simple URLs like https://google.com
- ✅ Check URL is publicly accessible

## 💡 Pro Tips

### Development:
- **Start with demo mode** for UI development
- **Add real API** when ready for testing
- **Cache results** to avoid quota limits
- **Test with various websites** to see different scores

### Production:
- **Set up monitoring** for API usage
- **Implement rate limiting** for user requests
- **Add error handling** for API failures
- **Consider caching** popular website results

---

**Ready to get real data? Follow the steps above and transform your MianScan into a professional website analysis tool! 🚀**