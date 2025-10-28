require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

// Phusion Passenger configuration for o2switch
if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
}

// Debug logging for backend
console.log('🔧 Initializing LoftBarber backend...');
console.log('Backend files:', require('fs').readdirSync(__dirname).slice(0, 10));

// Import database and routes
const { sequelize, defineAssociations } = require('./models');
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const dashboardRoutes = require('./routes/dashboard');
const employeeRoutes = require('./routes/employees');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');

// Import stats scheduler
const StatsScheduler = require('./services/statsScheduler');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP for o2switch compatibility
  hsts: false // Disable HSTS for o2switch compatibility
}));
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ["https://loft-barber.com", "https://www.loft-barber.com"]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Logger middleware
app.use(logger);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/packages', authenticateToken, packageRoutes);
app.use('/api/v1/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/v1/employees', authenticateToken, employeeRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/v1/csrf-token', (req, res) => {
  res.json({ csrfToken: 'disabled-for-production' });
});

// Serve static files from root directory (where built assets are copied) with proper MIME types
const frontendPath = path.join(__dirname, '..');

// DISABLED: Static file serving causing segfault on o2switch
// Let Apache/Nginx handle static files directly to avoid Node.js memory issues
// app.use('/assets', express.static(path.join(frontendPath, 'assets'), {
//   setHeaders: (res, path) => {
//     if (path.endsWith('.js')) {
//       res.setHeader('Content-Type', 'application/javascript');
//       res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
//     } else if (path.endsWith('.css')) {
//       res.setHeader('Content-Type', 'text/css');
//       res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
//     } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
//       res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
//     }
//   },
//   // Enable ETags and last-modified headers
//   etag: true,
//   lastModified: true
// }));

// SOLUTION: Specific routes for each asset type to avoid wildcard segfaults
const assetsPath = path.join(__dirname, '..', 'assets');
const fs = require('fs');

// Helper function to safely send asset files
function sendAssetFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Asset not found');
    }

    // Set cache headers for production
    if (filePath.endsWith('.js') || filePath.endsWith('.css') ||
        filePath.endsWith('.png') || filePath.endsWith('.jpg') ||
        filePath.endsWith('.jpeg') || filePath.endsWith('.gif') ||
        filePath.endsWith('.svg') || filePath.endsWith('.woff') ||
        filePath.endsWith('.woff2')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error sending asset:', error);
    res.status(500).send('Internal server error');
  }
}

// Specific routes for different asset types (avoiding wildcards)
app.get('/assets/index.js', (req, res) => {
  sendAssetFile(res, path.join(assetsPath, 'index.js'));
});

app.get('/assets/index.css', (req, res) => {
  sendAssetFile(res, path.join(assetsPath, 'index.css'));
});

app.get('/assets/index-*.js', (req, res) => {
  const filename = req.path.replace('/assets/', '');
  sendAssetFile(res, path.join(assetsPath, filename));
});

app.get('/assets/index-*.css', (req, res) => {
  const filename = req.path.replace('/assets/', '');
  sendAssetFile(res, path.join(assetsPath, filename));
});

app.get('/assets/*-*.js', (req, res) => {
  const filename = req.path.replace('/assets/', '');
  sendAssetFile(res, path.join(assetsPath, filename));
});

app.get('/assets/*-*.css', (req, res) => {
  const filename = req.path.replace('/assets/', '');
  sendAssetFile(res, path.join(assetsPath, filename));
});

// Fallback for other assets
app.get('/assets/*', (req, res) => {
  const filename = req.path.replace('/assets/', '');
  sendAssetFile(res, path.join(assetsPath, filename));
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const indexPath = path.join(__dirname, '..', 'index.html');
  res.sendFile(indexPath);
});

// Global error handler
app.use(errorHandler);

// Initialize database and start services
const initializeApp = async () => {
  try {
    console.log('🚀 Starting LoftBarber backend...');
    console.log('Port:', process.env.PORT || 3001);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Passenger:', process.env.PASSENGER_APP_ENV || 'not set');

    // Test database connection with timeout
    let dbConnected = false;
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      dbConnected = true;
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.error('Database config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      });
      console.error('⚠️  Application will continue without database - some features may not work');
    }

    if (dbConnected) {
      defineAssociations();
      await sequelize.sync();
      console.log('✅ Database synchronized successfully.');

      // Start stats scheduler
      const statsScheduler = new StatsScheduler();
      statsScheduler.start();
      console.log('✅ Stats scheduler started');
    }

    console.log('🎉 LoftBarber backend is ready!');

  } catch (error) {
    console.error('❌ Error initializing application:', error);
    console.error('Full error details:', error);

    // In Passenger environment, log but don't exit - let Passenger handle it
    if (typeof PhusionPassenger !== "undefined") {
      console.error('Application failed to start, but continuing in Passenger environment');
    } else {
      process.exit(1);
    }
  }
};

// Start the server
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export the app for Passenger
module.exports = app;

