#!/bin/bash

# Check for forbidden lock files
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
  echo "Error: Forbidden lock file found. This project uses pnpm."
  echo "Please remove package-lock.json and/or yarn.lock"
  exit 1
fi

# Check pnpm version
REQUIRED_VERSION="10.6.3"
CURRENT_VERSION=$(pnpm --version)

if [ "$CURRENT_VERSION" != "$REQUIRED_VERSION" ]; then
  echo "Error: Wrong pnpm version. Required: $REQUIRED_VERSION, Found: $CURRENT_VERSION"
  echo "Please run: npm install -g pnpm@$REQUIRED_VERSION"
  exit 1
fi

# Check if pnpm-lock.yaml exists
if [ ! -f "pnpm-lock.yaml" ]; then
  echo "Warning: pnpm-lock.yaml not found"
  exit 1
fi

echo "✓ Package manager check passed"
exit 0
