require('dotenv').config();

// Phusion Passenger configuration for o2switch
if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
}

// Debug logging for o2switch
console.log('🚀 Starting LoftBarber server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Passenger env:', process.env.PASSENGER_APP_ENV || 'not set');
console.log('Working directory:', process.cwd());
console.log('Files in directory:', require('fs').readdirSync('.').slice(0, 10));

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

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

const app = express();

// Export for Phusion Passenger
module.exports = app;

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve built frontend only if it exists
const frontendPath = path.join(__dirname, 'frontend/dist');
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log('✅ Serving frontend from:', frontendPath);
} else {
  console.log('⚠️ Frontend build not found at:', frontendPath);
}

// Logging middleware
app.use(logger);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/packages', authenticateToken, packageRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/employees', authenticateToken, employeeRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Serve React app for all other routes (only if frontend exists)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend/dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Return a simple HTML page if frontend is not built
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoftBarber - Backend Running</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .status { color: #28a745; font-weight: bold; font-size: 18px; }
    .api-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    .api-link:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>LoftBarber Backend</h1>
    <p class="status">✅ Backend is running successfully!</p>
    <p>The frontend build is not available yet. Please build the frontend and redeploy to see the full application.</p>
    <p><a href="/api/v1/health" class="api-link">Check API Health Status</a></p>
  </div>
</body>
</html>`);
  }
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

// Initialize the app
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}
