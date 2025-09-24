#!/bin/bash
# Google Cloud setup for ride.ma project

echo "🚀 Setting up Google Cloud for ride.ma..."

# Authenticate (if not already done)
echo "📝 Authenticating with Google Cloud..."
gcloud auth login --account=said.marricha@gmail.com

# Set or create project
echo "🏗️ Setting up project..."
gcloud config set project ride-ma-2024 || gcloud projects create ride-ma-2024 --name="Ride.ma Airport Transfer"
gcloud config set project ride-ma-2024

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable maps-backend.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable directions-backend.googleapis.com

# Create API key
echo "🔑 Creating API key..."
API_KEY=$(gcloud alpha services api-keys create --display-name="ride-ma-api-key" --format="value(name)")
FULL_API_KEY=$(gcloud alpha services api-keys get-key-string $API_KEY --format="value(keyString)")

echo "✅ Setup complete!"
echo "📋 Your API key: $FULL_API_KEY"
echo "💾 Add this to your .env.local file:"
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$FULL_API_KEY"
