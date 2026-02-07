# API Key Test

## Issue Found

The API key you provided: `AQ.Ab8RN6L3wan7wEqxsd9ag_xRPBOfYXy5VMoraNtlOAX9rjM4Og`

This appears to be a **Linear API key** (Linear is a project management tool), NOT a Google PageSpeed Insights API key.

## Google API Key Format

Google API keys typically look like:
```
AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

They:
- Start with `AIzaSy`
- Are 39 characters long
- Contain only alphanumeric characters and hyphens

## How to Get a Real Google PageSpeed API Key

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

### Step 2: Create or Select a Project
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it "MianScan" or similar
4. Click "Create"

### Step 3: Enable PageSpeed Insights API
1. Go to "APIs & Services" → "Library"
2. Search for "PageSpeed Insights API"
3. Click on it
4. Click "Enable"

### Step 4: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated key (starts with AIzaSy...)
4. (Optional) Click "Restrict Key" to limit it to PageSpeed Insights API only

### Step 5: Add to .env.local
```env
GOOGLE_PAGESPEED_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Current Status

Your application is configured correctly, but the API key is not a valid Google PageSpeed Insights API key.

Once you get the correct API key:
1. Replace the key in `.env.local`
2. Restart the development server
3. Test with any website URL

The application will then provide real Google PageSpeed data!
