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

// Conditionally create HTTP server and Socket.io only if not in Passenger environment
let server, io;
if (typeof PhusionPassenger === "undefined") {
    const { createServer } = require('http');
    const { Server } = require('socket.io');
    server = createServer(app);
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:5173"],
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

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

// Import socket manager
const { setIo } = require('./socket');

// Import stats scheduler
const StatsScheduler = require('./services/statsScheduler');

const app = express();

// Set io instance in socket manager (only if io exists)
if (io) {
    setIo(io);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }, // 5MB
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// CSRF protection (disabled in production for Passenger compatibility)
if (process.env.NODE_ENV === 'production' && typeof PhusionPassenger === "undefined") {
  try {
    const csurf = require('csurf');
    app.use(csurf({ cookie: true }));
  } catch (err) {
    console.warn('CSRF middleware not available, skipping...');
  }
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use(logger);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/packages', authenticateToken, packageRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/employees', authenticateToken, employeeRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/v1/csrf-token', (req, res) => {
  // In test mode, CSRF is disabled, so csrfToken function doesn't exist
  if (process.env.NODE_ENV === 'test') {
    res.json({ csrfToken: 'test-token-disabled' });
  } else {
    res.json({ csrfToken: req.csrfToken() });
  }
});

// Socket.io connection handling (only if not in Passenger environment and io exists)
if (typeof PhusionPassenger === "undefined" && io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-dashboard', (userId) => {
      socket.join(`dashboard-${userId}`);
    });

    socket.on('dashboard-update', (userId) => {
      io.to(`dashboard-${userId}`).emit('dashboard-data-updated');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

// Global error handler
app.use(errorHandler);

// Database initialization (for Passenger, don't call listen)
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting LoftBarber backend...');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Passenger: ${typeof PhusionPassenger !== "undefined" ? 'detected' : 'not detected'}`);

if (process.env.NODE_ENV === 'test') {
  // Use different port for tests to avoid conflicts
  const TEST_PORT = process.env.TEST_PORT || 3002;
  // Skip database connection and sync for tests
  if (server) {
    server.listen(TEST_PORT, () => {
      console.log(`Server running on port ${TEST_PORT} in test mode`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
} else {
  // Initialize database connection
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established successfully.');
      defineAssociations();
      return sequelize.sync({ alter: false }); // Don't alter in production
    })
    .then(() => {
      console.log('✅ Database synchronized successfully.');

      // Start stats scheduler after database sync
      try {
        const statsScheduler = new StatsScheduler();
        statsScheduler.start();
        console.log('✅ Stats scheduler started');
      } catch (err) {
        console.warn('⚠️ Stats scheduler failed to start:', err.message);
      }

      console.log(`✅ Server initialized successfully on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🎉 LoftBarber backend is ready!');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      console.error('Full error:', error);
      console.log('⚠️ Starting server without database connection...');
      console.log('⚠️ Database features will not work until connection is restored');

      // Don't exit in Passenger environment, let it handle the error
      if (typeof PhusionPassenger === "undefined") {
        process.exit(1);
      }
    });
}

// Graceful shutdown (only in non-Passenger environments)
if (typeof PhusionPassenger === "undefined") {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    if (server) {
      server.close(() => {
        console.log('Process terminated');
      });
    }
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    if (server) {
      server.close(() => {
        console.log('Process terminated');
      });
    }
  });
}

// Export app for Passenger (Phusion Passenger expects the Express app to be exported)
module.exports = app;
