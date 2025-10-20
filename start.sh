#!/bin/bash

# EasyGestion - Development Startup Script
echo "🚀 Starting EasyGestion Application in Development Mode..."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
DB_READY=false
for i in {1..30}; do
  if docker-compose exec -T mysql mysqladmin ping -h mysql --silent; then
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

# Install/update backend dependencies
echo "📦 Installing/updating backend dependencies..."
docker-compose exec backend npm install

# Install/update frontend dependencies
echo "📦 Installing/updating frontend dependencies..."
docker-compose exec frontend npm install

# Wait a bit for dependencies to settle
echo "⏳ Waiting for dependencies to settle..."
sleep 3

# Run database migrations/initialization
echo "🗄️ Initializing database..."
docker-compose exec backend node -e "
const { sequelize, defineAssociations } = require('./models');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // Define associations
    defineAssociations();

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');

    // Run migrations
    const migrationsDir = path.join(__dirname, 'database', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).sort();
      for (const file of migrationFiles) {
        if (file.endsWith('.sql')) {
          const migrationPath = path.join(migrationsDir, file);
          const sql = fs.readFileSync(migrationPath, 'utf8');
          const statements = sql.split(';').filter(stmt => stmt.trim());
          for (const statement of statements) {
            if (statement.trim()) {
              await sequelize.query(statement);
            }
          }
          console.log(\`✅ Migration \${file} executed\`);
        }
      }
    }

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

# Seed sample data
echo "🌱 Seeding sample data..."
docker-compose exec backend node database/seeders/sampleDataSeeder.js

# Initialize employee stats
echo "📊 Initializing employee stats..."
docker-compose exec backend node scripts/initializeEmployeeStats.js

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
BACKEND_READY=false
for i in {1..30}; do
  if curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    BACKEND_READY=true
    break
  fi
  echo "⏳ Waiting for backend... ($i/30)"
  sleep 2
done

if [ "$BACKEND_READY" = false ]; then
  echo "❌ Backend failed to start"
  exit 1
fi

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
FRONTEND_READY=false
for i in {1..30}; do
  if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready!"
    FRONTEND_READY=true
    break
  fi
  echo "⏳ Waiting for frontend... ($i/30)"
  sleep 2
done

if [ "$FRONTEND_READY" = false ]; then
  echo "❌ Frontend failed to start"
  exit 1
fi

# Check container status
echo "📊 Container status:"
docker-compose ps

echo "✅ EasyGestion is now running in development mode!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️ Database: localhost:3307"
echo ""
echo "📝 Development logs (Ctrl+C to exit):"
echo "   - Backend logs: docker-compose logs -f backend"
echo "   - Frontend logs: docker-compose logs -f frontend"
echo "   - All logs: docker-compose logs -f"

# Show logs (optional)
docker-compose logs -f
