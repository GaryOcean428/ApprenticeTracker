#!/bin/bash
# Railway Railpack Deployment Validation Script
# Validates that all required components are configured for successful Railway deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOMAIN=${1:-"localhost:5000"}
PROTOCOL="https"

# For localhost testing, use http
if [[ $DOMAIN == localhost* ]]; then
    PROTOCOL="http"
fi

BASE_URL="${PROTOCOL}://${DOMAIN}"

echo "🚀 Railway Deployment Validation for ApprenticeTracker"
echo "======================================================="
echo "Target: ${BASE_URL}"
echo "Using Railpack configuration"
echo ""

# Test 1: Configuration files validation
echo "✓ Validating configuration files..."

if [[ -f "$PROJECT_ROOT/railpack.json" ]]; then
    echo "  ✅ railpack.json found"
    # Validate JSON syntax
    if jq empty "$PROJECT_ROOT/railpack.json" >/dev/null 2>&1; then
        echo "  ✅ railpack.json is valid JSON"
    else
        echo "  ❌ railpack.json has invalid syntax"
        exit 1
    fi
else
    echo "  ❌ railpack.json not found"
    exit 1
fi

if [[ -f "$PROJECT_ROOT/railway.json" ]]; then
    echo "  ⚠️  Legacy railway.json found - should be removed for railpack deployment"
fi

if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
    echo "  ✅ .env.example found"
    # Check if UPLOAD_DIR is documented
    if grep -q "UPLOAD_DIR" "$PROJECT_ROOT/.env.example"; then
        echo "  ✅ UPLOAD_DIR documented in .env.example"
    else
        echo "  ⚠️  UPLOAD_DIR not documented in .env.example"
    fi
else
    echo "  ❌ .env.example not found"
fi

echo ""

# Test 2: Build system validation
echo "✓ Testing build configuration..."

if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    echo "  ✅ package.json found"
    
    # Check required scripts
    if jq -e '.scripts.build' "$PROJECT_ROOT/package.json" >/dev/null 2>&1; then
        echo "  ✅ Build script configured"
    else
        echo "  ❌ Build script missing"
        exit 1
    fi
    
    if jq -e '.scripts.start' "$PROJECT_ROOT/package.json" >/dev/null 2>&1; then
        echo "  ✅ Start script configured"
    else
        echo "  ❌ Start script missing"
        exit 1
    fi
    
    # Check packageManager specification
    if jq -e '.packageManager' "$PROJECT_ROOT/package.json" | grep -q "pnpm"; then
        echo "  ✅ PNPM package manager specified"
    else
        echo "  ⚠️  Package manager not specified or not PNPM"
    fi
else
    echo "  ❌ package.json not found"
    exit 1
fi

echo ""

# Test 3: Environment variable validation
echo "✓ Testing environment variable configuration..."

# Test UPLOAD_DIR behavior
cd "$PROJECT_ROOT"
if command -v node >/dev/null 2>&1; then
    # Test with unset UPLOAD_DIR (should use default)
    UPLOAD_DIR_TEST=$(unset UPLOAD_DIR && DOTENV_LOG_LEVEL=silent node --import tsx/esm -e "
        import { env } from './server/utils/env.ts';
        console.log(env.UPLOAD_DIR);
    " 2>/dev/null || echo "ERROR")
    
    if [[ "$UPLOAD_DIR_TEST" == "uploads" ]]; then
        echo "  ✅ UPLOAD_DIR defaults to 'uploads' when not set"
    elif [[ "$UPLOAD_DIR_TEST" == "ERROR" ]]; then
        echo "  ⚠️  Could not test UPLOAD_DIR (dependencies missing)"
    else
        echo "  ❌ UPLOAD_DIR default not working (got: $UPLOAD_DIR_TEST)"
    fi
    
    # Test with empty UPLOAD_DIR (should use default)
    UPLOAD_DIR_EMPTY_TEST=$(UPLOAD_DIR="" DOTENV_LOG_LEVEL=silent node --import tsx/esm -e "
        import { env } from './server/utils/env.ts';
        console.log(env.UPLOAD_DIR || 'EMPTY');
    " 2>/dev/null || echo "ERROR")
    
    if [[ "$UPLOAD_DIR_EMPTY_TEST" == "" ]]; then
        echo "  ⚠️  UPLOAD_DIR becomes empty string when set to empty (should use default)"
    elif [[ "$UPLOAD_DIR_EMPTY_TEST" == "EMPTY" ]]; then
        echo "  ⚠️  UPLOAD_DIR becomes empty when set to empty (should use default)"
    else
        echo "  ✅ UPLOAD_DIR handling works correctly"
    fi
else
    echo "  ⚠️  Node.js not available - cannot test environment variables"
fi

echo ""

# Test 4: Health check endpoints (if running)
if [[ $DOMAIN != "localhost"* ]] || command -v curl >/dev/null 2>&1; then
    echo "✓ Testing health check endpoints..."
    
    # Test Railway health check endpoint
    HEALTHZ_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/healthz" 2>/dev/null || echo "FAILED")
    
    if [[ $HEALTHZ_RESPONSE == *"HTTP_200"* ]]; then
        echo "  ✅ Railway health endpoint (/healthz) responding (200 OK)"
        # Extract and display the JSON response
        HEALTHZ_JSON=$(echo "$HEALTHZ_RESPONSE" | sed 's/HTTP_200$//')
        echo "    Response: $HEALTHZ_JSON"
    else
        echo "  ⚠️  Railway health endpoint (/healthz): $HEALTHZ_RESPONSE (may not be running)"
    fi
    
    # Test main health endpoint
    API_HEALTH_RESPONSE=$(curl -s -w "HTTP_%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "FAILED")
    
    if [[ $API_HEALTH_RESPONSE == *"HTTP_200"* ]]; then
        echo "  ✅ Main health endpoint (/api/health) responding (200 OK)"
    else
        echo "  ⚠️  Main health endpoint (/api/health): $API_HEALTH_RESPONSE (may not be running)"
    fi
else
    echo "  ⚠️  Skipping health check tests (curl not available or localhost without running service)"
fi

echo ""

# Test 5: Upload directory handling
echo "✓ Testing upload directory configuration..."

# Check if uploads directory can be created
TEMP_UPLOAD_DIR="/tmp/upload-test-$$"
if mkdir -p "$TEMP_UPLOAD_DIR" 2>/dev/null; then
    echo "  ✅ Directory creation works"
    rmdir "$TEMP_UPLOAD_DIR"
else
    echo "  ❌ Cannot create directories"
fi

# Check default upload directory
if [[ -d "$PROJECT_ROOT/uploads" ]]; then
    echo "  ✅ Default uploads directory exists"
elif mkdir -p "$PROJECT_ROOT/uploads" 2>/dev/null; then
    echo "  ✅ Default uploads directory created successfully"
    rmdir "$PROJECT_ROOT/uploads" 2>/dev/null || true
else
    echo "  ❌ Cannot create default uploads directory"
fi

echo ""
echo "=================================================="
echo "🎉 Railway deployment validation completed!"
echo ""

# Display deployment information
echo "📋 Deployment Information:"
echo "   Configuration: Railpack (recommended for Railway)"
echo "   Health Check: ${BASE_URL}/healthz"
echo "   API Health: ${BASE_URL}/api/health"
echo "   Application: ${BASE_URL}/"
echo ""

echo "🔧 Production Deployment Requirements:"
echo "   ✅ DATABASE_URL - PostgreSQL connection string"
echo "   ✅ JWT_SECRET - At least 32 characters"
echo "   ✅ FAIRWORK_API_URL - Fair Work API endpoint"
echo "   ✅ FAIRWORK_API_KEY - Fair Work API key"
echo "   ⚠️  UPLOAD_DIR - Optional, defaults to 'uploads' (recommend: /data/uploads with volume)"
echo ""

echo "🚀 Next Steps:"
echo "   1. Ensure all production environment variables are set in Railway dashboard"
echo "   2. Create and mount persistent volume for uploads: railway volume create --mount /data/uploads"
echo "   3. Set UPLOAD_DIR=/data/uploads in Railway environment"
echo "   4. Deploy using: railway up"
echo "   5. Monitor deployment logs and health endpoints"
echo ""

echo "💡 Tips:"
echo "   - Use 'railway logs' to monitor deployment"
echo "   - Use 'railway shell' to debug deployment issues"
echo "   - Check Railway dashboard for build logs and metrics"