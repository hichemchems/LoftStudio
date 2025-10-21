require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');
const { Server } = require('socket.io');
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

// Import socket manager
const { setIo } = require('./socket');

// Import stats scheduler
const StatsScheduler = require('./services/statsScheduler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Set io instance in socket manager
setIo(io);

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

// CSRF protection (disabled for API in development)
if (process.env.NODE_ENV === 'production') {
  app.use(csurf({ cookie: true }));
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

// Socket.io connection handling
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

// Global error handler
app.use(errorHandler);

// Database sync and server start
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'test') {
  // Use different port for tests to avoid conflicts
  const TEST_PORT = process.env.TEST_PORT || 3002;
  // Skip database connection and sync for tests
  server.listen(TEST_PORT, () => {
    console.log(`Server running on port ${TEST_PORT} in test mode`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      defineAssociations();
      return sequelize.sync();
    })
    .then(() => {
      // Start stats scheduler after database sync
      const statsScheduler = new StatsScheduler();
      statsScheduler.start();

      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('Stats scheduler started');
      });
    })
    .catch((error) => {
      console.error('Unable to connect to the database:', error);
      process.exit(1);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
