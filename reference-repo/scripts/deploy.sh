#!/bin/bash

# Check if VERCEL_TOKEN and VERCEL_PROJECT_ID are set
if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "Error: VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables must be set"
    exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
DEPLOY_URL=$(curl -X POST "https://api.vercel.com/v13/deployments" \
     -H "Authorization: Bearer $VERCEL_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "crm7r",
       "project": "'$VERCEL_PROJECT_ID'",
       "target": "production",
       "gitSource": {
         "type": "github",
         "repo": "Arcane-Fly/crm7",
         "ref": "main"
       }
     }' | jq -r '.url')

if [ $? -eq 0 ] && [ ! -z "$DEPLOY_URL" ]; then
    echo "Deployment started successfully!"
    echo "Deployment URL: https://$DEPLOY_URL"
else
    echo "Deployment failed"
    exit 1
fi
