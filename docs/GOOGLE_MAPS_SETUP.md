# Google Maps API Setup

This guide explains how to set up Google Maps API for the Head Office Dashboard.

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps JavaScript API)

## 2. Enable Maps JavaScript API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click "Enable"

## 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key

## 4. Restrict API Key (Security)

### Application Restrictions

1. Edit the API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domains:
   - Development: `http://localhost:*`
   - Production: `https://yourdomain.com/*`

### API Restrictions

1. Under "API restrictions", select "Restrict key"
2. Select only "Maps JavaScript API"

### Usage Quotas

1. Set daily request limits to prevent unexpected charges
2. Recommended: 1,000 requests/day for development
3. Adjust based on production needs

## 5. Configure Environment Variable

1. Copy `.env.example` to `.env`
2. Add your API key:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Never commit `.env` to version control

## 6. Monitoring

1. Monitor usage in Google Cloud Console
2. Check "APIs & Services" > "Dashboard"
3. Review costs under "Billing"

## Security Best Practices

- Use separate API keys for dev/staging/production
- Never expose API keys in client-side code (Maps API is an exception)
- Set HTTP referrer restrictions to prevent unauthorized use
- Enable only necessary APIs
- Monitor usage regularly
- Rotate keys if compromised

## Troubleshooting

### Map not loading

- Check API key is correct in `.env`
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure billing is enabled in Google Cloud

### "This page can't load Google Maps correctly"

- API key restrictions may be too strict
- Verify HTTP referrer matches current domain
- Check if Maps JavaScript API is enabled

### Exceeded quota

- Check usage in Google Cloud Console
- Increase quotas or optimize map usage
- Consider implementing map clustering for large datasets
