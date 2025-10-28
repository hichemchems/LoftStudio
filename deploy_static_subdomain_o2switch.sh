#!/bin/bash

# ===========================================
# DEPLOYMENT SCRIPT: Static Subdomain Solution
# LoftBarber - o2switch Infrastructure Fix
# ===========================================

echo "🚀 DEPLOYMENT: Static Subdomain Solution for LoftBarber"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATED PATH
MAIN_DOMAIN="loft-barber.com"
STATIC_SUBDOMAIN="static.loft-barber.com"
O2SWITCH_USER="dije1636"
REPO_URL="https://github.com/hichemchems/LoftStudio.git"

echo -e "${BLUE}Configuration:${NC}"
echo "  Main Domain: $MAIN_DOMAIN"
echo "  Static Subdomain: $STATIC_SUBDOMAIN"
echo "  o2switch User: $O2SWITCH_USER"
echo "  Static Directory: /home/$O2SWITCH_USER/static.loft-barber.com"
echo ""

# Step 1: Create static subdomain directory - UPDATED PATH
echo -e "${YELLOW}Step 1: Creating static subdomain directory...${NC}"
STATIC_DIR="/home/$O2SWITCH_USER/static.loft-barber.com"
if [ ! -d "$STATIC_DIR" ]; then
    mkdir -p "$STATIC_DIR"
    echo -e "${GREEN}✓ Created directory: $STATIC_DIR${NC}"
else
    echo -e "${BLUE}ℹ Directory already exists: $STATIC_DIR${NC}"
fi

# Step 2: Clone/update repository
echo -e "${YELLOW}Step 2: Cloning/updating repository...${NC}"
cd "$STATIC_DIR"
if [ ! -d ".git" ]; then
    git clone "$REPO_URL" .
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    git pull origin main
    echo -e "${GREEN}✓ Repository updated${NC}"
fi

# Step 3: Deploy assets
echo -e "${YELLOW}Step 3: Deploying assets...${NC}"
if [ -d "dist/assets" ]; then
    # Clean existing assets
    rm -rf assets/
    # Copy new assets
    cp -r dist/assets/ assets/
    echo -e "${GREEN}✓ Assets deployed to: $STATIC_DIR/assets/${NC}"
else
    echo -e "${RED}✗ Error: dist/assets not found. Run 'npm run build' first.${NC}"
    exit 1
fi

# Step 4: Set permissions
echo -e "${YELLOW}Step 4: Setting permissions...${NC}"
find "$STATIC_DIR" -type d -exec chmod 755 {} \;
find "$STATIC_DIR" -type f -exec chmod 644 {} \;
echo -e "${GREEN}✓ Permissions set (755 dirs, 644 files)${NC}"

# Step 5: Create .htaccess for static subdomain
echo -e "${YELLOW}Step 5: Creating .htaccess for static subdomain...${NC}"
cat > "$STATIC_DIR/.htaccess" << 'EOF'
# Static subdomain .htaccess - Apache serves files directly
# No Passenger/Node.js involvement

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache headers for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType application/x-javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable directory listing
Options -Indexes

# Handle missing files
ErrorDocument 404 /404.html
EOF
echo -e "${GREEN}✓ .htaccess created for static subdomain${NC}"

# Step 6: Test deployment
echo -e "${YELLOW}Step 6: Testing deployment...${NC}"
echo "Testing asset URLs:"
echo "  CSS:  https://$STATIC_SUBDOMAIN/assets/index-2m-1SyKW.css"
echo "  JS:   https://$STATIC_SUBDOMAIN/assets/index-BR6G2AvJ.js"

# Test with curl
echo ""
echo "Testing with curl:"
if command -v curl &> /dev/null; then
    echo -n "  CSS file: "
    CSS_STATUS=$(curl -s -I "https://$STATIC_SUBDOMAIN/assets/index-2m-1SyKW.css" | head -1 | cut -d' ' -f2)
    if [ "$CSS_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
    else
        echo -e "${RED}✗ Failed ($CSS_STATUS)${NC}"
    fi

    echo -n "  JS file:  "
    JS_STATUS=$(curl -s -I "https://$STATIC_SUBDOMAIN/assets/index-BR6G2AvJ.js" | head -1 | cut -d' ' -f2)
    if [ "$JS_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
    else
        echo -e "${RED}✗ Failed ($JS_STATUS)${NC}"
    fi
else
    echo "  curl not available - manual testing required"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Create subdomain '$STATIC_SUBDOMAIN' in cPanel pointing to: $STATIC_DIR"
echo "2. Test main site: https://$MAIN_DOMAIN"
echo "3. Verify assets load from: https://$STATIC_SUBDOMAIN/assets/"
echo ""
echo -e "${YELLOW}If issues persist:${NC}"
echo "- Check cPanel subdomain configuration"
echo "- Verify file permissions (755 dirs, 644 files)"
echo "- Check Apache error logs"
echo ""
echo -e "${BLUE}Files deployed:${NC}"
ls -la "$STATIC_DIR/assets/" | head -5
echo "..."
