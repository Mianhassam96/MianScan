# 🔑 How to Get Your Google PageSpeed Insights API Key

## The API key you provided appears to be invalid. Here's how to get the correct one:

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Click "New Project" or select an existing one
3. Give it a name like "MianScan API"

### Step 3: Enable PageSpeed Insights API
1. Go to "APIs & Services" → "Library"
2. Search for "PageSpeed Insights API"
3. Click on it and press "Enable"

### Step 4: Create API Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key (it should start with "AIza...")

### Step 5: (Optional) Restrict Your API Key
1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose "PageSpeed Insights API"
4. Save

## ⚠️ Important Notes:

- **Valid Google API keys start with "AIza"**
- **The key you provided starts with "AQ." which is not a Google API key format**
- **Free tier includes 25,000 requests per day**
- **No credit card required for the free tier**

## 🔄 Alternative: Use Demo Mode

If you don't want to set up the API right now, MianScan works perfectly in demo mode:

1. **Remove or comment out the API key** in `.env.local`
2. **The app will automatically show demo data** with a banner
3. **All features work** - you just see sample analysis results
4. **Perfect for showcasing** the application's capabilities

## 🚀 Once You Have the Real API Key:

```bash
# Update .env.local with your real API key:
GOOGLE_PAGESPEED_API_KEY=AIzaSy... (your real key here)
```

Then restart your development server and enjoy real website analysis! 🎉