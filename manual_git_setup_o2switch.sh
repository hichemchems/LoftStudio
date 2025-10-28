#!/bin/bash

# Manual git setup for o2switch when directory exists but no git repo
echo "🔧 Manual Git Setup for o2switch..."

# Navigate to the directory
cd /home/dije1636/static.loft-barber.com/

echo "📂 Current directory: $(pwd)"
echo "📋 Contents:"
ls -la

# Check if this is a git repository
if [ -d ".git" ]; then
    echo "✅ Git repository already exists"
    echo "📋 Git status:"
    git status
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "❌ No git repository found"
    echo "🔄 Initializing git repository..."
    
    # Initialize git
    git init
    git remote add origin https://github.com/hichemchems/LoftStudio.git
    
    # Fetch and checkout
    git fetch origin
    git checkout -b main origin/main
    
    echo "✅ Git repository initialized and synced"
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x deploy_static_subdomain_o2switch.sh 2>/dev/null || echo "deploy_static_subdomain_o2switch.sh not found"
chmod +x alternative_deployment_options.sh 2>/dev/null || echo "alternative_deployment_options.sh not found"
chmod +x fix_git_pull_o2switch.sh 2>/dev/null || echo "fix_git_pull_o2switch.sh already executable"

echo "✅ Setup complete!"
echo "📋 Available scripts:"
ls -la *.sh 2>/dev/null || echo "No .sh files found"

echo ""
echo "🚀 Ready to deploy!"
echo "Run: ./deploy_static_subdomain_o2switch.sh"
