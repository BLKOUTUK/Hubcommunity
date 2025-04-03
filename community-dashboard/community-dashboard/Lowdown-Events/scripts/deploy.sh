#!/bin/bash

# BLKOUT UK Events Calendar Deployment Script

echo "Starting deployment process..."

# Build the application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

echo "Build successful."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo "Netlify CLI not found. Installing..."
  npm install -g netlify-cli
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -ne 0 ]; then
  echo "Deployment failed."
  exit 1
fi

echo "Deployment completed successfully!"