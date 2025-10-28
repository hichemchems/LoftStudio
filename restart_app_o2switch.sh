#!/bin/bash

# Script to restart LoftBarber app on o2switch after deployment
# Run this script via SSH in the application directory

echo "🔄 Restarting LoftBarber application on o2switch..."

# Navigate to application directory
cd /home/dije1636/public_html/loftbarber || {
    echo "❌ Error: Could not navigate to application directory"
    exit 1
}

echo "📍 Current directory: $(pwd)"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if pull was successful
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

echo "✅ Changes pulled successfully"

# Check current files
echo "📋 Current files:"
ls -la | grep -E "\.(js|html|htaccess)$"

# Restart Passenger application
echo "🔄 Restarting Passenger application..."

# Method 1: Touch restart.txt (most common way)
if [ -f "restart.txt" ]; then
    touch restart.txt
    echo "✅ Touched restart.txt"
else
    touch restart.txt
    echo "✅ Created and touched restart.txt"
fi

# Method 2: Kill Passenger processes (if needed)
echo "🔍 Checking for Passenger processes..."
PASSENGER_PIDS=$(ps aux | grep passenger | grep dije1636 | awk '{print $2}' | head -5)
if [ ! -z "$PASSENGER_PIDS" ]; then
    echo "Found Passenger processes: $PASSENGER_PIDS"
    echo "⚠️  Killing Passenger processes..."
    kill -9 $PASSENGER_PIDS 2>/dev/null
    echo "✅ Passenger processes killed"
fi

# Method 3: Touch tmp/restart.txt (alternative)
if [ -d "tmp" ]; then
    touch tmp/restart.txt
    echo "✅ Touched tmp/restart.txt"
else
    mkdir -p tmp
    touch tmp/restart.txt
    echo "✅ Created tmp/ and touched tmp/restart.txt"
fi

echo ""
echo "🎉 Application restart initiated!"
echo ""
echo "🧪 Test the application:"
echo "curl -s -I https://loft-barber.com/assets/index.js | head -5"
echo "curl -s https://loft-barber.com/ | head -10"
echo ""
echo "⏱️  Wait 30-60 seconds for Passenger to fully restart"
