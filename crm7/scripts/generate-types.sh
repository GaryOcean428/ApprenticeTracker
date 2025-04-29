#!/bin/bash

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Error: SUPABASE_PROJECT_ID environment variable is not set"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Generate types
echo "Generating types..."
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > lib/types/database.ts

# Format the generated file
echo "Formatting types..."
pnpm prettier --write lib/types/database.ts

echo "Types generated successfully!"
