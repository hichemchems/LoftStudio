#!/bin/bash

# Script pour corriger les problèmes restants identifiés
echo "🔧 CORRECTION PROBLÈMES RESTANTS LoftBarber"
echo "==========================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 1. Corriger server.js (le sed a échoué)
log_step "1. Correction de server.js"
cat > server.js << 'EOF'
// Phusion Passenger configuration for o2switch
if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
}

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Debug logging for o2switch
console.log('🚀 Starting LoftBarber server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Passenger env:', process.env.PASSENGER_APP_ENV || 'not set');
console.log('Working directory:', process.cwd());

// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import database and models
const { sequelize, testConnection } = require('./backend/config/database');
const defineAssociations = require('./backend/models').defineAssociations;

// Import routes
const authRoutes = require('./backend/routes/auth');
const dashboardRoutes = require('./backend/routes/dashboard');
const employeeRoutes = require('./backend/routes/employees');
const packageRoutes = require('./backend/routes/packages');

// Import middleware
const { errorHandler } = require('./backend/middleware/errorHandler');
const { logger } = require('./backend/middleware/logger');

// Import services
const StatsScheduler = require('./backend/services/statsScheduler');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ["https://loft-barber.com", "https://www.loft-barber.com"]
      : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ["https://loft-barber.com", "https://www.loft-barber.com"]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Logging middleware
app.use(logger);

// Serve static files from frontend build
const frontendPath = path.join(__dirname, 'frontend', 'dist');
console.log('✅ Serving frontend from:', frontendPath);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else if (path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));
}

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/packages', packageRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'LoftBarber API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Catch-all handler for SPA (must be after API routes)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Handle dashboard updates
  socket.on('request-dashboard-update', (userId) => {
    socket.join(`dashboard-${userId}`);
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    console.log('🚀 Starting LoftBarber backend...');

    // Test database connection
    await testConnection();

    // Define model associations
    defineAssociations();

    // Sync database (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    } else {
      await sequelize.sync();
      console.log('✅ Database synchronized successfully.');
    }

    // Start stats scheduler
    const statsScheduler = new StatsScheduler();
    statsScheduler.start();

    const PORT = process.env.PORT || 3001;
    console.log('Port:', PORT);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Passenger:', process.env.PASSENGER_APP_ENV);

    // Start server
    if (typeof PhusionPassenger !== "undefined") {
      // Production with Passenger
      server.listen('passenger');
    } else {
      // Development
      server.listen(PORT, () => {
        console.log(`🎉 LoftBarber backend listening on port ${PORT}`);
      });
    }

    console.log('🎉 LoftBarber backend is ready!');

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Handle graceful shutdown
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

// Start the application
initializeApp();
EOF
log_info "✅ server.js corrigé avec gestion d'erreurs complète"

# 2. Corriger le fichier .htaccess avec le bon chemin de log
log_step "2. Correction du chemin des logs dans .htaccess"
sed -i 's|PassengerAppLogFile /home/dije1636/logs/loftbarber.log|PassengerAppLogFile /home/dije1636/public_html/loftbarber/logs/passenger.log|' .htaccess
log_info "✅ Chemin des logs corrigé dans .htaccess"

# 3. Créer le dossier logs s'il n'existe pas
log_step "3. Création du dossier logs"
mkdir -p logs
log_info "✅ Dossier logs créé"

# 4. Corriger les permissions
log_step "4. Correction des permissions"
chmod 644 .htaccess server.js
chmod 755 logs
log_info "✅ Permissions corrigées"

# 5. Tester le démarrage
log_step "5. Test de démarrage rapide"
timeout 5s node test_startup.js 2>/dev/null

if [ $? -eq 0 ]; then
    log_info "✅ Test de démarrage réussi"
else
    log_error "❌ Test de démarrage échoué"
fi

echo ""
echo "=========================================="
echo "🎯 CORRECTIONS SUPPLÉMENTAIRES APPLIQUÉES"
echo "=========================================="
echo ""
echo "✅ server.js entièrement réécrit avec gestion d'erreurs"
echo "✅ Chemin des logs corrigé dans .htaccess"
echo "✅ Dossier logs créé"
echo "✅ Permissions corrigées"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrez via cPanel > Node.js Selector > Restart"
echo "2. Vérifiez les logs: tail -f logs/passenger.log"
echo "3. Testez: curl -I https://loft-barber.com/api/v1/health"
echo ""
echo "🔍 Les logs Passenger sont maintenant dans: logs/passenger.log"
