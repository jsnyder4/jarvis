#!/bin/bash

# Jarvis Dashboard - Deployment Script for Raspberry Pi
# This script pulls the latest code from GitHub and restarts the app

echo "🚀 Deploying Jarvis Dashboard..."

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "❌ Git pull failed!"
  exit 1
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed!"
  exit 1
fi

echo "✅ Deployment complete!"
echo ""
echo "To start the app, run:"
echo "  npm start"
echo ""
echo "To setup auto-start on boot, we'll configure that in a future step."
