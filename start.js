#!/usr/bin/env node

console.log('🚀 Starting LoftBarber application...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '3001');

try {
  // Load environment variables
  require('dotenv').config();
  console.log('✅ Environment variables loaded');

  // Try to start the server
  const { app, server } = require('./server.js');
  console.log('✅ Server module loaded successfully');

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

} catch (error) {
  console.error('❌ Error starting application:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
