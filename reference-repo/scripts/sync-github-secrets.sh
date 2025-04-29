#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated with gh
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub CLI first using: gh auth login"
    exit 1
fi

# Get repository name from git config
REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\).git/\1/')

# Function to add or update a secret
add_secret() {
    local name=$1
    local value=$2
    echo "Setting secret: $name"
    echo "$value" | gh secret set "$name" --repo="$REPO" 2>/dev/null
}

# Read from .env.local and set secrets
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    
    # Remove quotes and spaces
    key=$(echo "$key" | tr -d ' ')
    value=$(echo "$value" | tr -d '"' | tr -d "'")
    
    # Add secret to GitHub
    add_secret "$key" "$value"
done < .env.local

# Add additional required secrets
add_secret "SUPABASE_PROJECT_ID" "iykrauzuutvmnxpqppzk"
add_secret "SUPABASE_ACCESS_TOKEN" "sbp_0660189d3190e870160bad283b93117c5d57cab7"
add_secret "GH_PA_TOKEN" "$GITHUB_TOKEN"

echo "✅ All secrets have been synced to GitHub!"
