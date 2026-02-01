#!/bin/bash

# OurAuto Mobile Build Setup Script
# This script automates Capacitor setup for Android & iOS builds

set -e

echo "🚀 OurAuto Mobile Setup Starting..."
echo ""

# Check if Node.js installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build Next.js
echo "🔨 Building Next.js..."
npm run build
echo "✅ Next.js built"
echo ""

# Initialize Capacitor if needed
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚙️ Initializing Capacitor..."
    npx cap init ourauto com.ourauto.app --web-dir out
    echo "✅ Capacitor initialized"
else
    echo "✅ Capacitor already initialized"
fi
echo ""

# Add Android platform
echo "🤖 Adding Android platform..."
if [ ! -d "android" ]; then
    npx cap add android
    echo "✅ Android platform added"
else
    echo "✅ Android platform already exists"
fi
echo ""

# Sync Android
echo "🔄 Syncing Android platform..."
npx cap sync android
echo "✅ Android synced"
echo ""

# Add iOS platform (Mac only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Adding iOS platform (macOS detected)..."
    if [ ! -d "ios" ]; then
        npx cap add ios
        echo "✅ iOS platform added"
    else
        echo "✅ iOS platform already exists"
    fi
    echo ""
    
    echo "🔄 Syncing iOS platform..."
    npx cap sync ios
    echo "✅ iOS synced"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next steps:"
echo ""
echo "For Android:"
echo "  npm run cap:open:android"
echo "  or"
echo "  npm run cap:build:android"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "For iOS (macOS only):"
    echo "  npm run cap:open:ios"
    echo "  or"
    echo "  npm run cap:build:ios"
    echo ""
fi

echo "📖 See CAPACITOR_SETUP_GUIDE.md for full documentation"
echo ""
