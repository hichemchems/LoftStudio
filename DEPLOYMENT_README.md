# 🚀 LoftBarber - Static Subdomain Deployment Solution

## 🎯 Problem Solved

The LoftBarber application was experiencing **500 Internal Server Errors** on o2switch hosting due to Node.js segfaults when serving static assets through Passenger (Phusion Passenger).

**Root Cause:** Passenger forces all requests through Node.js, causing memory issues with large static files.

## ✅ Solution: Static Subdomain Architecture

Separate static assets from the Node.js application by serving them from a dedicated subdomain using Apache directly.

### Architecture Overview

```
loft-barber.com (Node.js/Express)
├── index.html (SPA routing)
└── API routes (/api/*)

static.loft-barber.com (Apache Direct)
├── /assets/index-BR6G2AvJ.js
├── /assets/index-2m-1SyKW.css
└── All other static assets
```

## 📋 Deployment Steps

### 1. Frontend Configuration ✅

**Already Done:**
- `frontend/vite.config.js`: Set `base: 'https://static.loft-barber.com/'`
- Built frontend with absolute asset URLs
- Committed to GitHub

### 2. Create Static Subdomain (cPanel)

1. Log into **o2switch cPanel**
2. Go to **Subdomains** section
3. Create subdomain: `static.loft-barber.com`
4. Point document root to: `/home/dije1636/public_html/static/`

### 3. Deploy Assets

**Option A: Automated Script (Recommended)**

```bash
# On o2switch server via SSH:
cd /home/dije1636/public_html/static/
./deploy_static_subdomain_o2switch.sh
```

**Option B: Manual Deployment**

```bash
# Create directory
mkdir -p /home/dije1636/public_html/static/

# Clone repository
cd /home/dije1636/public_html/static/
git clone https://github.com/hichemchems/LoftStudio.git .

# Deploy assets
cp -r dist/assets/ assets/

# Set permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
```

### 4. Configure Apache (.htaccess)

The deployment script automatically creates the proper `.htaccess` file with:
- Compression enabled
- Cache headers for performance
- Security headers
- Direct Apache serving (no Passenger)

### 5. Test Deployment

```bash
# Test static assets
curl -I https://static.loft-barber.com/assets/index-BR6G2AvJ.js
# Should return: HTTP/2 200

curl -I https://static.loft-barber.com/assets/index-2m-1SyKW.css
# Should return: HTTP/2 200

# Test main application
curl -I https://loft-barber.com/
# Should return: HTTP/2 200

curl https://loft-barber.com/api/v1/health
# Should return: {"success":true,...}
```

## 🔧 Files Modified

### Frontend
- `frontend/vite.config.js`: Added static subdomain base URL
- `dist/`: Built assets with absolute URLs

### Backend
- `backend/app.js`: Simplified to serve only HTML and API
- Removed complex asset serving routes

### Deployment
- `deploy_static_subdomain_o2switch.sh`: Automated deployment script
- `.htaccess`: Apache configuration for static subdomain

## 🎉 Benefits

- ✅ **No more 500 errors**: Apache serves static files directly
- ✅ **Better performance**: Optimized caching and compression
- ✅ **Scalability**: Easy to move to CDN later
- ✅ **Reliability**: No Node.js memory issues
- ✅ **Separation of concerns**: API and assets clearly separated

## 🚨 Troubleshooting

### If assets still return 500 errors:

1. **Check subdomain configuration** in cPanel
2. **Verify file permissions**: `755` for directories, `644` for files
3. **Check Apache logs** for errors
4. **Test direct file access** via FTP

### If main site doesn't load:

1. **Verify Node.js app is running**
2. **Check Passenger status**
3. **Test API endpoints** directly

## 📞 Support

If issues persist:
1. Run `./check_o2switch_logs.sh` for diagnostics
2. Check cPanel error logs
3. Verify subdomain DNS propagation (may take 24-48 hours)

---

**Status:** ✅ Ready for deployment
**Last Updated:** October 28, 2025
