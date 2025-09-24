# Quick Setup Guide - Google Maps API

## Current Status
✅ **Working Now**: 
- Address suggestions for popular Morocco locations (hotels, airports, etc.)
- Manual address typing (type any address you want)
- Form submission with typed addresses
- Map placeholder with loading state

❌ **Needs API Key**:
- Real Google Places autocomplete
- Interactive map with actual routes
- Address validation

## How to Enable Full Google Maps Features

### Step 1: Get Google Maps API Key (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: Create new project or use existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable: "Maps JavaScript API"
   - Search and enable: "Places API" 
   - Search and enable: "Directions API"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "API Key"
   - Copy the generated API key

### Step 2: Add API Key to Project

1. **Open `.env.local` file** in your project root
2. **Replace this line**:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```
   **With your actual key**:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Restart Development Server

```bash
npm run dev
```

## What You'll Get

### Before API Key:
- ✅ Hotel suggestions for Rabat (La Tour Hassan Palace, Sofitel, etc.)
- ✅ Manual typing works for any address
- ✅ Form submission works
- ❌ Map shows placeholder

### After API Key:
- ✅ **Real Google autocomplete** - type any address and get suggestions
- ✅ **Interactive map** - see actual route with red line
- ✅ **Address validation** - Google validates addresses
- ✅ **Professional experience** - looks like Uber/booking.com

## Cost (Don't Worry!)

Google Maps has **generous free tiers**:
- **Maps JavaScript API**: 28,000 map loads/month FREE
- **Places API**: First $200/month FREE (≈12,000 requests)
- **Directions API**: First $200/month FREE (≈40,000 requests)

For a booking website, you'll likely stay within free limits.

## Testing

**Try typing these in the address fields**:
- "Hotel Villa Mandarine, Rabat" (should appear in suggestions)
- "La Tour Hassan Palace" (should appear in suggestions)
- "Sofitel Rabat" (should appear in suggestions)
- Or type any address manually!

**The form works either way** - with or without API key!
