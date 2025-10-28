#!/bin/bash

# Fix for git pull on o2switch when directory already exists
echo "🔧 Fixing git pull on o2switch..."

# Navigate to the directory
cd /home/dije1636/static.loft-barber.com/

# Check git status
echo "📋 Git status:"
git status

# If there are uncommitted changes, stash them
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes found. Stashing..."
    git stash
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Restore stashed changes if any
if [[ -n $(git stash list) ]]; then
    echo "🔄 Restoring stashed changes..."
    git stash pop
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x deploy_static_subdomain_o2switch.sh
chmod +x alternative_deployment_options.sh

echo "✅ Ready to deploy!"
echo "Run: ./deploy_static_subdomain_o2switch.sh"
