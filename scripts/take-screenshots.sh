#!/bin/bash

echo "🚀 Starting screenshot automation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if puppeteer is installed
if [ ! -d "node_modules/puppeteer" ]; then
    echo "📦 Installing Puppeteer..."
    npm install puppeteer --save-dev
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Puppeteer"
        exit 1
    fi
fi

# Create screenshots directory
mkdir -p screenshots

# Run the screenshot script
echo "📸 Taking screenshots..."
node scripts/take-screenshots.js

if [ $? -eq 0 ]; then
    echo "✅ Screenshots completed successfully!"
    echo "📁 Check the 'screenshots' folder for PNG files"
    
    # Try to open screenshots folder (optional)
    if command -v open &> /dev/null; then
        # macOS
        open screenshots
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open screenshots
    fi
else
    echo "❌ Screenshot process failed"
    exit 1
fi