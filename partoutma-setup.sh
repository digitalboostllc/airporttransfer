#!/bin/bash
# Google Cloud setup for partoutma project

echo "🚀 Setting up Google Maps APIs for partoutma project..."

# Set your existing project
echo "🏗️ Using existing partoutma project..."
gcloud config set project partoutma

# Enable required APIs for Maps
echo "🔧 Enabling Google Maps APIs..."
gcloud services enable maps-backend.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable directions-backend.googleapis.com

# Alternative API names if above don't work
echo "🔧 Enabling alternative API names..."
gcloud services enable maps.googleapis.com
gcloud services enable places.googleapis.com
gcloud services enable directions.googleapis.com

# Create API key for ride.ma
echo "🔑 Creating API key for ride.ma..."
gcloud alpha services api-keys create --display-name="ride-ma-maps-key" --format="value(name)" > /tmp/keyname.txt
KEY_NAME=$(cat /tmp/keyname.txt)

# Get the API key string
echo "📋 Getting API key..."
API_KEY=$(gcloud alpha services api-keys get-key-string $KEY_NAME --format="value(keyString)")

echo "✅ Setup complete!"
echo "📋 Your API key: $API_KEY"
echo ""
echo "💾 Now add this to your .env.local file:"
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$API_KEY"

# Clean up temp file
rm -f /tmp/keyname.txt
