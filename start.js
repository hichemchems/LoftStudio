#!/usr/bin/env node

console.log('🚀 Starting LoftBarber application...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '3001');

try {
  // Load environment variables
  require('dotenv').config();
  console.log('✅ Environment variables loaded');

  // Start the server directly
  require('./server.js');
  console.log('✅ Server started successfully');

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
