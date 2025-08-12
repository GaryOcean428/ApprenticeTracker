#!/bin/bash
# Railway Railpack Deployment Validation Script
# Usage: ./scripts/validate-deployment.sh [domain]
# Example: ./scripts/validate-deployment.sh crm7.up.railway.app

set -e

DOMAIN=${1:-"localhost:3000"}
PROTOCOL="https"

# For localhost testing, use http
if [[ $DOMAIN == localhost* ]]; then
    PROTOCOL="http"
fi

BASE_URL="${PROTOCOL}://${DOMAIN}"

echo "🚀 Validating Railpack deployment at ${BASE_URL}"
echo "=================================================="

# Test 1: Health check endpoint
echo "✓ Testing health check endpoint..."
HEALTH_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/api/health" || echo "FAILED")

if [[ $HEALTH_RESPONSE == *"HTTP_200"* ]]; then
    echo "  ✅ Health endpoint responding (200 OK)"
    # Extract and display the JSON response
    HEALTH_JSON=$(echo "$HEALTH_RESPONSE" | sed 's/HTTP_200$//')
    echo "  📊 Response: $HEALTH_JSON"
else
    echo "  ❌ Health endpoint failed: $HEALTH_RESPONSE"
    exit 1
fi

# Test 2: Main application endpoint
echo ""
echo "✓ Testing main application..."
APP_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/" -o /dev/null || echo "FAILED")

if [[ $APP_RESPONSE == "HTTP_200" ]]; then
    echo "  ✅ Main application responding (200 OK)"
else
    echo "  ❌ Main application failed: $APP_RESPONSE"
fi

# Test 3: API route functionality
echo ""
echo "✓ Testing API routes..."
API_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/api/auth/health" || echo "FAILED")

if [[ $API_RESPONSE == *"HTTP_200"* ]]; then
    echo "  ✅ API routes responding (200 OK)"
else
    echo "  ⚠️  API auth health check: $API_RESPONSE (may require authentication)"
fi

# Test 4: Static assets
echo ""
echo "✓ Testing static asset serving..."
FAVICON_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/favicon.ico" -o /dev/null || echo "FAILED")

if [[ $FAVICON_RESPONSE == "HTTP_200" ]]; then
    echo "  ✅ Static assets serving correctly"
elif [[ $FAVICON_RESPONSE == "HTTP_204" ]]; then
    echo "  ✅ Static assets configured (no content response)"
else
    echo "  ⚠️  Static assets: $FAVICON_RESPONSE (may be expected)"
fi

echo ""
echo "=================================================="
echo "🎉 Railpack deployment validation completed!"
echo ""

# Display deployment information
echo "📋 Deployment Information:"
echo "   Domain: ${DOMAIN}"
echo "   Health Check: ${BASE_URL}/api/health"
echo "   Application: ${BASE_URL}/"
echo ""

echo "🔧 Next Steps:"
echo "   1. Monitor application logs for any errors"
echo "   2. Test key user workflows"
echo "   3. Verify database connectivity and environment variables"
echo "   4. Monitor build times for cache effectiveness"