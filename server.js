require('dotenv').config();

// Phusion Passenger configuration for o2switch
if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import database and routes
const { sequelize, defineAssociations } = require('./backend/models');
const authRoutes = require('./backend/routes/auth');
const packageRoutes = require('./backend/routes/packages');
const dashboardRoutes = require('./backend/routes/dashboard');
const employeeRoutes = require('./backend/routes/employees');

// Import middleware
const { authenticateToken } = require('./backend/middleware/auth');
const { errorHandler } = require('./backend/middleware/errorHandler');
const { logger } = require('./backend/middleware/logger');

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
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

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
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LoftBarber - Backend Running</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #333; }
          p { color: #666; }
          .status { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>LoftBarber Backend</h1>
          <p class="status">✅ Backend is running successfully!</p>
          <p>The frontend build is not available. Please build the frontend and redeploy.</p>
          <p><strong>API Health Check:</strong> <a href="/api/v1/health">/api/v1/health</a></p>
        </div>
      </body>
      </html>
    `);
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

    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    defineAssociations();
    await sequelize.sync();
    console.log('✅ Database synchronized successfully.');

    console.log('🎉 LoftBarber backend is ready!');

  } catch (error) {
    console.error('❌ Error initializing application:', error);
    // Don't exit in Passenger environment, let it handle the error
    if (typeof PhusionPassenger === "undefined") {
      process.exit(1);
    }
  }
};

// Initialize the app
initializeApp();
