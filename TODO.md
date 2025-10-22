# LoftBarber - Production Deployment to o2switch (cPanel)

## Overview
Resolve cPanel directory conflict and deploy Node.js app to o2switch production. Shift from Docker to direct Node.js hosting.

## Steps

### 1. Directory and File Upload
- [x] Clear conflicting directory `/home/dije1636/public_html/loftbarber` (user completed)
- [ ] Upload entire project to `/home/dije1636/public_html/loftbarber` via cPanel File Manager or FTP
  - Ensure `backend/package.json` and `backend/server.js` are at the root level or adjust app root in cPanel
  - Note: cPanel expects `package.json` in the application root; if needed, move backend files to root or set app root to `backend/`

### 2. Fix Critical Bugs
- [x] Fix `backend/models/EmployeeStats.js`: Complete the `getStats` method (already complete)
- [x] Fix `backend/services/statsService.js`: Replace `consoNaN });` with `console.error` (no such error found)
- [x] Verify `backend/scripts/initializeEmployeeStats.js` logic (logic appears correct)

### 3. Update Deployment Scripts
- [x] Update `deploy.sh`: Change path to `/home/dije1636/public_html/loftbarber`, remove Docker commands
- [x] Create `deploy_o2switch.sh`: Script for non-Docker deployment (upload, npm install, build)

### 4. Configure Environment
- [ ] Set environment variables in cPanel:
  - NODE_ENV: production
  - PORT: 3001 (or assigned by o2switch)
  - DB_HOST: (o2switch MySQL host)
  - DB_PORT: 3306
  - DB_NAME: (o2switch database name)
  - DB_USER: (o2switch MySQL user)
  - DB_PASSWORD: (o2switch MySQL password)
  - JWT_SECRET: (secure key)
  - JWT_EXPIRE: 10d
  - BCRYPT_ROUNDS: 12
- [x] Update `frontend/vite.config.js` for production domain and API URL

### 5. Install and Build
- [ ] Run "Run NPM Install" in cPanel (requires package.json present)
- [ ] Build frontend: Run `npm run build` in frontend directory via SSH or cPanel
- [ ] Initialize database: Run migrations and seeders via SSH

### 6. Test and Go Live
- [ ] Test app via https://loft-barber.com
- [ ] Monitor logs and health checks
- [ ] Configure SSL and domain if not done

## Notes
- cPanel does not support Docker; deployment must be direct Node.js
- Ensure o2switch MySQL database is created and credentials are correct
- If package.json error persists, confirm file upload and path
