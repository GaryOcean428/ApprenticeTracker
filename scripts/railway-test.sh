#!/bin/bash

# Railway Deployment Test Script
# This script helps test the SSL certificate fix for Railway PostgreSQL

echo "🚀 Railway Deployment Test - SSL Certificate Fix"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

echo "📋 Checking environment variables required for Railway..."

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set (this will be set in Railway)"
else
    echo "✅ DATABASE_URL is set"
fi

if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV not set - will default to development"
    export NODE_ENV=development
else
    echo "✅ NODE_ENV is set to: $NODE_ENV"
fi

echo ""
echo "🔧 Testing build process..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📊 Build summary:"
ls -la dist/ 2>/dev/null || echo "No dist directory found"

echo ""
echo "🔍 SSL Configuration Summary:"
echo "- Enhanced SSL configuration in server/db.ts"
echo "- Retry logic: 3 attempts with 2 second delays"
echo "- SSL options: rejectUnauthorized=false, requestCert=false"
echo "- Connection timeout: 10 seconds"
echo "- Database connection initialization before migrations"

echo ""
echo "📝 Railway Deployment Checklist:"
echo "□ Set DATABASE_URL environment variable in Railway"
echo "□ Set NODE_ENV=production in Railway"
echo "□ Set FAIRWORK_API_KEY environment variable"
echo "□ Set FAIRWORK_API_URL environment variable"
echo "□ Verify build command: npm run build"
echo "□ Verify start command: npm start"

echo ""
echo "🚀 Ready for Railway deployment!"
echo ""
echo "After deployment, check Railway logs for:"
echo "- '✅ Database connected successfully' message"
echo "- Successful schema migrations"
echo "- No 'self-signed certificate' errors"

echo ""
echo "If issues persist, check:"
echo "1. DATABASE_URL format: postgresql://user:pass@host:port/db?sslmode=require"
echo "2. Railway PostgreSQL SSL settings"
echo "3. Application startup logs for connection attempts"