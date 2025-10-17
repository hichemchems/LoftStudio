#!/bin/bash

# EasyGestion - Startup Script
echo "🚀 Starting EasyGestion Application..."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Check if database is healthy
echo "🔍 Checking database health..."
DB_READY=false
for i in {1..30}; do
  if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
    echo "✅ Database is ready!"
    DB_READY=true
    break
  fi
  echo "⏳ Waiting for database... ($i/30)"
  sleep 2
done

if [ "$DB_READY" = false ]; then
  echo "❌ Database failed to start"
  exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
docker-compose exec backend npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
docker-compose exec frontend npm install --legacy-peer-deps

# Run database migrations/initialization
echo "🗄️ Initializing database..."
docker-compose exec backend node -e "
const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');

    // Run init.sql if it exists
    const initSQL = path.join(__dirname, 'database', 'init.sql');
    if (fs.existsSync(initSQL)) {
      const sql = fs.readFileSync(initSQL, 'utf8');
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await sequelize.query(statement);
        }
      }
      console.log('✅ Initial data inserted');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDB();
"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Check if backend is healthy
echo "🔍 Checking backend health..."
BACKEND_READY=false
for i in {1..20}; do
  if curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    BACKEND_READY=true
    break
  fi
  echo "⏳ Waiting for backend... ($i/20)"
  sleep 2
done

if [ "$BACKEND_READY" = false ]; then
  echo "❌ Backend failed to start"
  exit 1
fi

# Check container status
echo "📊 Container status:"
docker-compose ps

echo "✅ EasyGestion is now running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️ Database: localhost:3307"

# Show logs (optional)
echo "📝 Showing logs (Ctrl+C to exit)..."
docker-compose logs -f
