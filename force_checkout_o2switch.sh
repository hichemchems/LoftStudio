#!/bin/bash

# Force checkout main branch on o2switch, overwriting local files
echo "🔧 Force checkout main branch on o2switch..."

# Navigate to the directory
cd /home/dije1636/static.loft-barber.com/

echo "📂 Current directory: $(pwd)"

# Force checkout main branch (this will overwrite local files)
echo "🔄 Force checking out main branch..."
git checkout -f main

# Or if main doesn't exist locally, fetch and checkout
if [ $? -ne 0 ]; then
    echo "Main branch not found locally, fetching..."
    git fetch origin
    git checkout -f origin/main
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x deploy_static_subdomain_o2switch.sh 2>/dev/null || echo "deploy_static_subdomain_o2switch.sh not found"
chmod +x alternative_deployment_options.sh 2>/dev/null || echo "alternative_deployment_options.sh not found"
chmod +x fix_git_pull_o2switch.sh 2>/dev/null || echo "fix_git_pull_o2switch.sh already executable"
chmod +x manual_git_setup_o2switch.sh 2>/dev/null || echo "manual_git_setup_o2switch.sh already executable"

echo "✅ Force checkout complete!"
echo "📋 Available scripts:"
ls -la *.sh 2>/dev/null || echo "No .sh files found"

echo ""
echo "🚀 Ready to deploy!"
echo "Run: ./deploy_static_subdomain_o2switch.sh"
