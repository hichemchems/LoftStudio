#!/bin/bash

# Script de diagnostic complet pour LoftBarber sur o2switch
# Version mise à jour avec corrections des problèmes identifiés

echo "🔍 DIAGNOSTIC COMPLET LoftBarber - o2switch"
echo "=========================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 1. Vérifier l'environnement Node.js
log_step "1. Vérification de l'environnement Node.js"
echo "Activation de l'environnement virtuel..."
source ~/nodevenv/public_html/loftbarber/20/bin/activate

if [ $? -ne 0 ]; then
    log_error "Impossible d'activer l'environnement Node.js virtuel"
    echo "Vérifiez la configuration dans cPanel > Node.js Selector"
    exit 1
fi

log_info "Environnement Node.js activé"
node --version
npm --version

# 2. Vérifier la structure des fichiers
log_step "2. Vérification de la structure des fichiers"
REQUIRED_FILES=("server.js" "backend/app.js" "backend/package.json" "frontend/dist/index.html")

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "✅ $file trouvé"
    else
        log_error "❌ $file manquant"
    fi
done

# 3. Vérifier les node_modules
log_step "3. Vérification des dépendances"
if [ -d "node_modules" ]; then
    log_info "✅ node_modules présent"
    MODULES_TO_CHECK=("express" "sequelize" "mysql2" "cors" "helmet")
    for module in "${MODULES_TO_CHECK[@]}"; do
        if [ -d "node_modules/$module" ]; then
            log_info "✅ Module $module installé"
        else
            log_error "❌ Module $module manquant"
        fi
    done
else
    log_error "❌ node_modules manquant - exécutez: npm install"
fi

# 4. Tester la syntaxe des fichiers
log_step "4. Test de syntaxe des fichiers JavaScript"
SYNTAX_FILES=("server.js" "backend/app.js")

for file in "${SYNTAX_FILES[@]}"; do
    if [ -f "$file" ]; then
        node -c "$file" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_info "✅ Syntaxe $file OK"
        else
            log_error "❌ Erreur de syntaxe dans $file"
        fi
    fi
done

# 5. Tester les imports principaux
log_step "5. Test des imports principaux"
node -e "
try {
    console.log('Test Express...');
    require('express');
    console.log('✅ Express OK');

    console.log('Test Sequelize...');
    require('sequelize');
    console.log('✅ Sequelize OK');

    console.log('Test mysql2...');
    require('mysql2');
    console.log('✅ mysql2 OK');

    console.log('Test backend/models...');
    require('./backend/models');
    console.log('✅ Models OK');
} catch (error) {
    console.log('❌ Erreur import:', error.message);
    process.exit(1);
}
" 2>/dev/null

if [ $? -eq 0 ]; then
    log_info "✅ Tous les imports réussis"
else
    log_error "❌ Problème d'imports"
fi

# 6. Vérifier la configuration de la base de données
log_step "6. Test de connexion à la base de données"
node -e "
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

console.log('Tentative de connexion DB...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion DB réussie');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Erreur DB:', err.message);
    process.exit(1);
  });
" 2>/dev/null

if [ $? -eq 0 ]; then
    log_info "✅ Connexion base de données OK"
else
    log_error "❌ Problème de connexion base de données"
fi

# 7. Vérifier les variables d'environnement
log_step "7. Vérification des variables d'environnement"
ENV_VARS=("NODE_ENV" "DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET")

for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        if [ "$var" = "DB_PASSWORD" ]; then
            log_info "✅ $var défini (masqué)"
        else
            log_info "✅ $var = ${!var}"
        fi
    else
        log_error "❌ $var non défini"
    fi
done

# 8. Vérifier les logs disponibles
log_step "8. Recherche des logs disponibles"
echo "Logs système trouvés:"
find /home/$(whoami) -name "*.log" -type f 2>/dev/null | grep -v ".npm" | head -10

# Logs spécifiques à l'application
echo ""
echo "Logs Passenger/Application:"
PASSENGER_LOG="${HOME}/logs/loftbarber.log"
if [ -f "$PASSENGER_LOG" ]; then
    log_info "✅ Log Passenger trouvé: $PASSENGER_LOG"
    echo "Dernières 10 lignes:"
    tail -10 "$PASSENGER_LOG"
else
    log_warn "⚠️ Log Passenger non trouvé: $PASSENGER_LOG"
fi

# 9. Test de démarrage manuel limité
log_step "9. Test de démarrage manuel (timeout 10s)"
echo "Tentative de démarrage de l'application..."
timeout 10s node server.js &
APP_PID=$!
sleep 5

if kill -0 $APP_PID 2>/dev/null; then
    log_info "✅ Application démarrée (PID: $APP_PID)"
    kill $APP_PID
    log_info "Application arrêtée pour le test"
else
    log_error "❌ Application n'a pas pu démarrer"
fi

# 10. Test des endpoints
log_step "10. Test des endpoints"
echo "Test de l'endpoint santé:"
curl -s -I https://loft-barber.com/api/v1/health | head -3

echo ""
echo "Test de la page principale:"
curl -s -I https://loft-barber.com/ | head -3

# 11. Recommandations finales
log_step "11. Résumé et recommandations"

echo ""
echo "=========================================="
echo "📋 RÉSUMÉ DU DIAGNOSTIC"
echo "=========================================="

# Vérifier si l'app fonctionne
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://loft-barber.com/api/v1/health)
if [ "$APP_STATUS" = "200" ]; then
    log_info "🎉 L'application semble fonctionner correctement!"
else
    log_error "❌ L'application ne fonctionne pas (code HTTP: $APP_STATUS)"

    echo ""
    echo "🔧 ACTIONS RECOMMANDÉES:"
    echo "1. Vérifiez les logs Passenger: tail -f ~/logs/loftbarber.log"
    echo "2. Redémarrez l'application via cPanel > Node.js Selector > Restart"
    echo "3. Vérifiez la configuration Passenger dans .htaccess"
    echo "4. Testez manuellement: source ~/nodevenv/... && node server.js"
fi

echo ""
echo "📞 Pour plus d'aide, partagez les logs d'erreur détaillés."
