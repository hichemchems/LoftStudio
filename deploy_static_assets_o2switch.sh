#!/bin/bash

# Script to deploy static assets to separate directory on o2switch
# This creates a public/assets directory served directly by Apache

echo "🔧 Deploying static assets to separate directory on o2switch..."

# Navigate to application directory
cd /home/dije1636/public_html/loftbarber || {
    echo "❌ Error: Could not navigate to application directory"
    exit 1
}

echo "📍 Current directory: $(pwd)"

# Create public directory structure
echo "📁 Creating public directory structure..."
mkdir -p public/assets

# Copy assets to public directory
echo "📋 Copying assets to public directory..."
if [ -d "assets" ]; then
    cp -r assets/* public/assets/ 2>/dev/null || echo "⚠️  Some assets may not have copied"
    echo "✅ Assets copied to public/assets/"
else
    echo "❌ Assets directory not found!"
    exit 1
fi

# Copy index.html to public directory
if [ -f "index.html" ]; then
    cp index.html public/
    echo "✅ index.html copied to public/"
else
    echo "❌ index.html not found!"
    exit 1
fi

# Set correct permissions
echo "🔒 Setting permissions..."
chmod -R 755 public/
find public/ -type f -exec chmod 644 {} \;

# Verify the structure
echo "📋 Verifying structure:"
ls -la public/
ls -la public/assets/ | head -5

echo ""
echo "🎉 Static assets deployed to public/ directory!"
echo ""
echo "🧪 Test the new setup:"
echo "curl -s -I https://loft-barber.com/public/assets/index.js | head -5"
echo "curl -s https://loft-barber.com/public/ | head -10"
echo ""
echo "📝 Next step: Update .htaccess to redirect /assets/ to /public/assets/"
