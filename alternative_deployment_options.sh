#!/bin/bash

# ===========================================
# ALTERNATIVE DEPLOYMENT OPTIONS
# When static.loft-barber.com subdomain already exists
# ===========================================

echo "🔄 ALTERNATIVE DEPLOYMENT OPTIONS"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Option 1: Use existing static subdomain${NC}"
echo "If static.loft-barber.com already exists:"
echo "1. Check current configuration in cPanel"
echo "2. Ensure it points to: /home/dije1636/public_html/static/"
echo "3. Run deployment script:"
echo -e "${BLUE}  cd /home/dije1636/public_html/static/ && ./deploy_static_subdomain_o2switch.sh${NC}"
echo ""

echo -e "${YELLOW}Option 2: Use different subdomain name${NC}"
echo "Choose an alternative name:"
echo "- assets.loft-barber.com"
echo "- files.loft-barber.com"
echo "- cdn.loft-barber.com"
echo "- statics.loft-barber.com"
echo ""
echo "Steps:"
echo "1. Create new subdomain with chosen name"
echo "2. Update vite.config.js base URL"
echo "3. Rebuild frontend"
echo "4. Deploy to new subdomain directory"
echo ""

echo -e "${YELLOW}Option 3: Use subdirectory on main domain${NC}"
echo "Deploy to: https://loft-barber.com/static/"
echo ""
echo "Steps:"
echo "1. Create /home/dije1636/public_html/static/ directory"
echo "2. Deploy assets there"
echo "3. Update vite.config.js: base: '/static/'"
echo "4. Configure .htaccess to bypass Passenger for /static/"
echo ""

echo -e "${YELLOW}Option 4: Check existing DNS records${NC}"
echo "Run these commands on o2switch server:"
echo -e "${BLUE}"
echo "# Check existing DNS"
echo "dig static.loft-barber.com"
echo ""
echo "# Check current directory"
echo "ls -la /home/dije1636/public_html/static/"
echo ""
echo "# Check cPanel subdomains"
echo "# Login to cPanel > Subdomains > Check existing entries"
echo -e "${NC}"

echo -e "${YELLOW}Quick Fix Commands:${NC}"
echo ""
echo "# If subdomain exists but wrong directory:"
echo -e "${BLUE}cPanel > Subdomains > Edit static.loft-barber.com > Change document root${NC}"
echo ""
echo "# If you want to delete and recreate:"
echo -e "${BLUE}cPanel > Subdomains > Remove static.loft-barber.com > Wait 30min > Recreate${NC}"
echo ""

echo -e "${GREEN}RECOMMENDED: Option 1 - Use existing subdomain${NC}"
echo "Most likely the subdomain exists from previous attempts."
echo "Just ensure it points to the correct directory and deploy."
echo ""

echo "Choose your option:"
echo "1) Use existing static subdomain"
echo "2) Use different subdomain name"
echo "3) Use subdirectory on main domain"
echo "4) Check existing DNS records"
echo ""
echo -e "${GREEN}For your case, Option 1 is recommended since the subdomain already exists.${NC}"
