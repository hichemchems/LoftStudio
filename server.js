require('dotenv').config();
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
    res.status(404).json({
      error: 'Frontend not built',
      message: 'Please run npm run build in the frontend directory'
    });
  }
});

// Global error handler
app.use(errorHandler);

// Database sync and server start
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting LoftBarber server...');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Try to connect to database
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    defineAssociations();
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Database synchronized successfully.');

    // Start server only after database is ready
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
      });
    });

    module.exports = { app, server };
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Starting server without database connection...');

    // Start server even without database
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} (without database)`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('⚠️ Database features will not work until connection is restored');
    });

    module.exports = { app, server };
  });
