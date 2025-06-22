#!/bin/bash

# Contract Manager - Production Deployment Script
# This script prepares and deploys the application to Vercel

set -e

echo "🚀 Starting Contract Manager Production Deployment"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Build the application locally first
echo "🔧 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Verify all environment variables are set in Vercel dashboard"
echo "2. Test authentication flow"
echo "3. Test contract creation and analysis"
echo "4. Check Sentry error monitoring dashboard"
echo "5. Monitor performance and error rates"
echo ""
echo "🎉 Your Contract Manager is live!"