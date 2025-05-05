#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Warning: .env.local file not found"
fi

# Start the Next.js development server
yarn next dev -p 5145
