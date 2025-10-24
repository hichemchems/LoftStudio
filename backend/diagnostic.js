require('dotenv').config();
console.log('🔍 Starting LoftBarber Diagnostic...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3001);

// Test 1: Check if required modules can be loaded
try {
  console.log('\n📦 Testing module imports...');
  const express = require('express');
  console.log('✅ Express loaded');

  const { sequelize } = require('./config/database');
  console.log('✅ Sequelize loaded');

  const { defineAssociations } = require('./models');
  console.log('✅ Models loaded');

  console.log('✅ All modules loaded successfully');
} catch (error) {
  console.error('❌ Module loading failed:', error.message);
  process.exit(1);
}

// Test 2: Check database connection
async function testDatabase() {
  try {
    console.log('\n🗄️ Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PORT:', process.env.DB_PORT);

    await sequelize.authenticate();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

// Test 3: Check file paths
function testFilePaths() {
  console.log('\n📁 Testing file paths...');
  const fs = require('fs');
  const path = require('path');

  const frontendPath = path.join(__dirname, '../frontend/dist');
  console.log('Frontend path:', frontendPath);

  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend build directory exists');
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html exists');
    } else {
      console.log('⚠️ index.html not found');
    }
  } else {
    console.log('⚠️ Frontend build directory not found');
  }

  const uploadsPath = path.join(__dirname, 'uploads');
  console.log('Uploads path:', uploadsPath);
  if (fs.existsSync(uploadsPath)) {
    console.log('✅ Uploads directory exists');
  } else {
    console.log('⚠️ Uploads directory not found');
  }
}

// Test 4: Check environment variables
function testEnvironment() {
  console.log('\n🔧 Testing environment variables...');
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  let allPresent = true;

  required.forEach(key => {
    if (process.env[key]) {
      console.log(`✅ ${key}: ${key.includes('PASSWORD') ? '***' : process.env[key]}`);
    } else {
      console.log(`❌ ${key}: missing`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('✅ All required environment variables present');
  } else {
    console.log('⚠️ Some environment variables are missing');
  }
}

// Run all tests
async function runDiagnostics() {
  testEnvironment();
  testFilePaths();
  await testDatabase();

  console.log('\n🏁 Diagnostic complete');
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
