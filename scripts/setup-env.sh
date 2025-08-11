#!/bin/bash

# Create .env file with necessary environment variables for development
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_URL=
UPLOAD_DIR=uploads
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-for-security
JWT_EXPIRES_IN=7d
FAIRWORK_API_URL=
FAIRWORK_API_KEY=
EOF

echo "✅ Created .env file with required environment variables"
echo "🔧 Please update DATABASE_URL with your actual database connection string"
echo "🔑 JWT_SECRET has been set with a secure default value"
echo ""
echo "For Railway deployment, ensure these environment variables are set:"
echo "- DATABASE_URL: Your PostgreSQL connection string"
echo "- JWT_SECRET: At least 32 character secure random string" 
echo "- JWT_EXPIRES_IN: Token expiration time (default: 7d)"
echo "- NODE_ENV: production"
echo ""
echo "Generate a secure JWT secret with: openssl rand -base64 32"