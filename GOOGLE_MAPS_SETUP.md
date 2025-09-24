# Google Maps Setup Guide

## Overview
The hero section now includes an interactive map that shows real routes between selected addresses, making the booking experience much more professional and visual.

## Features Added
- **Real Address Autocomplete**: Users can type any address in Morocco
- **Interactive Route Map**: Shows the actual route with a red line
- **Google Places Integration**: Suggestions for popular Morocco locations
- **Professional Layout**: 3-column layout with text, form, and map

## Setting Up Google Maps API

### 1. Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"

### 2. Enable Required APIs
Enable these APIs in your Google Cloud project:
- **Maps JavaScript API** (for the map display)
- **Places API** (for address autocomplete)
- **Directions API** (for route calculation)

### 3. Configure API Key
1. Copy your API key
2. Open `.env.local` file in project root
3. Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 4. Restrict API Key (Recommended)
For security, restrict your API key:
1. In Google Cloud Console, click on your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain (e.g., `localhost:3001` for development)

## Development Mode
Without an API key, the components will:
- Show popular Morocco locations as fallback suggestions
- Display a placeholder map with loading state
- Still allow form submission with typed addresses

## Production Deployment
Before deploying:
1. Get a production Google Maps API key
2. Set up billing in Google Cloud (required for production use)
3. Add your production domain to API key restrictions
4. Set the environment variable in your hosting platform

## Cost Considerations
Google Maps APIs have generous free tiers:
- Maps JavaScript API: 28,000 map loads per month free
- Places API: $17 per 1000 requests (first $200/month free)
- Directions API: $5 per 1000 requests (first $200/month free)

For a typical booking website, you'll likely stay within free limits.
