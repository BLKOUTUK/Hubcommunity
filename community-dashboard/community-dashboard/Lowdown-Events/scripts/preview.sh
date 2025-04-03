#!/bin/bash

# BLKOUT UK Events Calendar Preview Script

echo "Starting preview server..."

# Check if the dist directory exists
if [ ! -d "dist" ]; then
  echo "Building application first..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo "Build failed. Cannot start preview."
    exit 1
  fi
fi

# Start the preview server
echo "Starting preview server..."
npm run preview

if [ $? -ne 0 ]; then
  echo "Failed to start preview server."
  exit 1
fi