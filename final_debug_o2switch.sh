#!/bin/bash

# Script final de débogage pour identifier la cause exacte de l'erreur 500
echo "🔍 DÉBOGAGE FINAL LoftBarber - o2switch"
echo "======================================="

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

# 1. Vérifier les permissions des logs
log_step "1. Vérification des permissions des logs"
ls -la logs/
chmod 644 logs/passenger.log 2>/dev/null || echo "Log file doesn't exist yet"

# 2. Tester manuellement le démarrage avec logs détaillés
log_step "2. Test de démarrage manuel détaillé"
echo "Démarrage de l'application en arrière-plan avec timeout..."

# Démarrer l'app en arrière-plan
timeout 15s node server.js > startup.log 2>&1 &
APP_PID=$!

# Attendre un peu
sleep 3

# Vérifier si l'app tourne
if kill -0 $APP_PID 2>/dev/null; then
    log_info "✅ Application démarrée (PID: $APP_PID)"
    echo "Logs de démarrage:"
    cat startup.log
    kill $APP_PID
else
    log_error "❌ Application n'a pas pu démarrer"
    echo "Logs d'erreur:"
    cat startup.log
fi

# 3. Tester les imports un par un
log_step "3. Test des imports individuels"
echo "Test de chaque import principal:"

node -e "
try {
    console.log('1. Testing dotenv...');
    require('dotenv').config();
    console.log('✅ dotenv OK');

    console.log('2. Testing express...');
    const express = require('express');
    console.log('✅ express OK');

    console.log('3. Testing database config...');
    const { sequelize, testConnection } = require('./backend/config/database');
    console.log('✅ database config OK');

    console.log('4. Testing models...');
    const models = require('./backend/models');
    console.log('✅ models OK');

    console.log('5. Testing routes...');
    const authRoutes = require('./backend/routes/auth');
    const dashboardRoutes = require('./backend/routes/dashboard');
    const employeeRoutes = require('./backend/routes/employees');
    const packageRoutes = require('./backend/routes/packages');
    console.log('✅ routes OK');

    console.log('6. Testing middleware...');
    const { errorHandler } = require('./backend/middleware/errorHandler');
    const { logger } = require('./backend/middleware/logger');
    console.log('✅ middleware OK');

    console.log('7. Testing services...');
    const StatsScheduler = require('./backend/services/statsScheduler');
    console.log('✅ services OK');

    console.log('🎉 All imports successful!');
} catch (error) {
    console.log('❌ Import error:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
}
" 2>&1

if [ $? -eq 0 ]; then
    log_info "✅ Tous les imports réussis"
else
    log_error "❌ Problème d'imports"
fi

# 4. Tester la connexion DB isolément
log_step "4. Test de connexion DB isolé"
node -e "
require('dotenv').config();
const { sequelize } = require('./backend/config/database');

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

sequelize.authenticate()
  .then(() => {
    console.log('✅ DB connection successful');
    return sequelize.close();
  })
  .catch(err => {
    console.log('❌ DB connection failed:', err.message);
    process.exit(1);
  });
" 2>&1

# 5. Vérifier les variables d'environnement
log_step "5. Vérification détaillée des variables d'environnement"
echo "Variables d'environnement actuelles:"
echo "NODE_ENV: $NODE_ENV"
echo "DB_HOST: $DB_HOST"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: ${DB_PASSWORD:0:10}..."
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "PORT: $PORT"
echo "PASSENGER_APP_ENV: $PASSENGER_APP_ENV"

# 6. Tester l'environnement Passenger
log_step "6. Test de l'environnement Passenger"
echo "Variables Passenger:"
echo "PASSENGER_APP_ENV: $PASSENGER_APP_ENV"
echo "PASSENGER_APP_ROOT: $PASSENGER_APP_ROOT"
echo "PASSENGER_APP_TYPE: $PASSENGER_APP_TYPE"

# 7. Vérifier les fichiers de configuration
log_step "7. Vérification des fichiers de configuration"
echo "Fichiers présents:"
ls -la | grep -E '\.(js|json|env|htaccess)$'

echo ""
echo "Contenu de package.json:"
head -20 package.json

# 8. Test de l'endpoint health avec curl détaillé
log_step "8. Test de l'endpoint health"
echo "Test avec curl détaillé:"
curl -v https://loft-barber.com/api/v1/health 2>&1 | head -20

# 9. Vérifier les processus Node.js
log_step "9. Vérifier les processus Node.js en cours"
echo "Processus Node.js:"
ps aux | grep node | grep -v grep

# 10. Recommandations finales
log_step "10. Recommandations finales"
echo ""
echo "=========================================="
echo "📋 RÉSUMÉ DU DÉBOGAGE"
echo "=========================================="

echo ""
echo "🔧 ACTIONS RECOMMANDÉES:"
echo "1. Vérifiez les logs détaillés dans startup.log"
echo "2. Redémarrez l'application via cPanel > Node.js Selector > Restart"
echo "3. Vérifiez les logs Passenger: tail -f logs/passenger.log"
echo "4. Testez à nouveau: curl -I https://loft-barber.com/api/v1/health"
echo ""
echo "📄 Fichiers de logs à consulter:"
echo "- startup.log (logs de démarrage manuel)"
echo "- logs/passenger.log (logs Passenger)"
echo "- /home/dije1636/logs/error_log (logs Apache)"
echo ""
echo "🔍 Si le problème persiste, partagez le contenu de startup.log"
