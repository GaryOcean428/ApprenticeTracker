#!/bin/bash

# Check for forbidden lock files
if [ -f "package-lock.json" ] || [ -f "pnpm-lock.yaml" ]; then
  echo "Error: Forbidden lock file found. This project uses yarn."
  echo "Please remove package-lock.json and/or pnpm-lock.yaml"
  exit 1
fi

# Check if yarn.lock exists
if [ ! -f "yarn.lock" ]; then
  echo "Warning: yarn.lock not found"
  exit 1
fi

echo "✓ Package manager check passed"
exit 0
