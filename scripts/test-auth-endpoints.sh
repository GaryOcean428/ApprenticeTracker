#!/bin/bash

# Test script for authentication endpoints
# Usage: ./test-auth-endpoints.sh [BASE_URL]

BASE_URL=${1:-"http://localhost:5000"}
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testpassword123"

echo "🧪 Testing authentication endpoints at $BASE_URL"
echo "=================================================="

# Test health endpoint
echo -e "\n1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/auth/health")
echo "$HEALTH_RESPONSE"

# Test register endpoint (if not exists)
echo -e "\n2. Testing registration endpoint..."
REGISTER_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")
echo "$REGISTER_RESPONSE"

# Test login endpoint with email
echo -e "\n3. Testing login endpoint with email..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
echo "$LOGIN_RESPONSE"

# Extract token from login response (if successful)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "\n4. Testing token verification with extracted token..."
  VERIFY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "$BASE_URL/api/auth/verify" \
    -H "Authorization: Bearer $TOKEN")
  echo "$VERIFY_RESPONSE"
else
  echo -e "\n4. Testing token verification endpoint (no token)..."
  VERIFY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "$BASE_URL/api/auth/verify")
  echo "$VERIFY_RESPONSE"
fi

echo -e "\n=================================================="
echo "✅ Authentication endpoint testing completed"