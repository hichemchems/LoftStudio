#!/bin/bash

# Script to fix permissions on o2switch server for LoftBarber deployment
# Run this script via SSH in the root directory of your application

echo "🔧 Fixing permissions for LoftBarber on o2switch..."

# Navigate to the application root (adjust path if needed)
cd /home/dije1636/public_html/loftbarber || {
    echo "❌ Error: Could not navigate to application directory"
    echo "Please check the path and run: cd /home/dije1636/public_html/loftbarber"
    exit 1
}

echo "📁 Current directory: $(pwd)"
echo "📂 Contents: $(ls -la | head -10)"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found!"
    echo "Please ensure you're in the correct directory and dist folder exists"
    exit 1
fi

echo "🔒 Applying correct permissions..."
echo "Setting directories to 755..."
chmod -R 755 dist

echo "Setting files to 644..."
find dist -type f -exec chmod 644 {} \;

echo "✅ Permissions applied successfully!"
echo "📋 Verification:"
echo "Directories (755): $(find dist -type d -exec ls -ld {} \; | head -3)"
echo "Files (644): $(find dist -type f -exec ls -l {} \; | head -3)"

echo ""
echo "🧪 Test the fix by running:"
echo "curl -s -I https://loft-barber.com/assets/index.js | head -5"
echo ""
echo "Expected: HTTP/2 200 or 404 (not 500)"
