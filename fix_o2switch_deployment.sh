#!/bin/bash

# Script de correction pour le déploiement LoftBarber sur o2switch
# Corrige les problèmes identifiés dans le diagnostic

echo "🔧 CORRECTION DÉPLOIEMENT LoftBarber - o2switch"
echo "==============================================="

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

# 1. Sauvegarde des fichiers actuels
log_step "1. Création de sauvegardes"
if [ -f ".htaccess" ]; then
    cp .htaccess .htaccess.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde .htaccess créée"
fi

if [ -f "server.js" ]; then
    cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde server.js créée"
fi

# 2. Correction du fichier .htaccess
log_step "2. Correction de la configuration Passenger (.htaccess)"
cat > .htaccess << 'EOF'
# Phusion Passenger configuration for Node.js
PassengerAppRoot /home/dije1636/public_html/loftbarber
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerFriendlyErrorPages on
PassengerAppLogFile /home/dije1636/logs/loftbarber.log

# Enable rewrite engine
RewriteEngine On

# Handle client-side routing (exclude API routes)
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType font/woff "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 month"
</IfModule>
EOF
log_info "✅ .htaccess corrigé avec configuration Passenger complète"

# 3. Correction du fichier server.js pour gérer les erreurs de démarrage
log_step "3. Correction de server.js pour une meilleure gestion d'erreurs"
sed -i.bak '
// Phusion Passenger configuration for o2switch
if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
}

// Debug logging for o2switch
console.log('\''🚀 Starting LoftBarber server...'\'');
console.log('\''Node version:'\'', process.version);
console.log('\''Environment:'\'', process.env.NODE_ENV || '\''development'\'');
console.log('\''Passenger env:'\'', process.env.PASSENGER_APP_ENV || '\''not set'\'');
console.log('\''Working directory:'\'', process.cwd());
console.log('\''Files in directory:'\'', require('\''fs'\'').readdirSync('\''.'\'').slice(0, 10));
' server.js

# Ajouter une gestion d'erreur globale au début
sed -i '1a\
// Global error handler for uncaught exceptions\
process.on('\''uncaughtException'\'', (err) => {\
  console.error('\''Uncaught Exception:'\'', err);\
  process.exit(1);\
});\
\
process.on('\''unhandledRejection'\'', (reason, promise) => {\
  console.error('\''Unhandled Rejection at:'\'', promise, '\''reason:'\'', reason);\
  process.exit(1);\
});\
' server.js

log_info "✅ server.js corrigé avec gestion d'erreurs globale"

# 4. Créer un fichier de configuration de base de données corrigé
log_step "4. Correction de la configuration base de données"
mkdir -p backend/config

cat > backend/config/database.js << 'EOF'
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
      // Support pour les mots de passe avec caractères spéciaux
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: false
    }
  }
);

// Test connection avec timeout
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    throw error;
  }
};

module.exports = { sequelize, testConnection };
EOF
log_info "✅ Configuration base de données corrigée"

# 5. Créer un script de test de démarrage isolé
log_step "5. Création d'un script de test de démarrage"
cat > test_startup.js << 'EOF'
#!/usr/bin/env node

// Script de test de démarrage isolé pour diagnostiquer les problèmes
console.log('🧪 TEST DE DÉMARRAGE LoftBarber');
console.log('================================');

// Test 1: Variables d'environnement
console.log('\n1. Variables d\'environnement:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[DÉFINI]' : '[NON DÉFINI]');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[DÉFINI]' : '[NON DÉFINI]');

// Test 2: Imports de base
console.log('\n2. Test des imports:');
try {
    const express = require('express');
    console.log('✅ Express importé');

    const { Sequelize } = require('sequelize');
    console.log('✅ Sequelize importé');

    const mysql2 = require('mysql2');
    console.log('✅ mysql2 importé');

    const cors = require('cors');
    console.log('✅ cors importé');

    const helmet = require('helmet');
    console.log('✅ helmet importé');
} catch (error) {
    console.log('❌ Erreur d\'import:', error.message);
    process.exit(1);
}

// Test 3: Connexion DB
console.log('\n3. Test de connexion DB:');
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
    pool: { max: 1, min: 0, acquire: 10000, idle: 5000 }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion DB réussie');
    return sequelize.close();
  })
  .then(() => {
    console.log('✅ Test terminé avec succès');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Erreur DB:', err.message);
    process.exit(1);
  });
EOF

chmod +x test_startup.js
log_info "✅ Script de test de démarrage créé"

# 6. Corriger les permissions
log_step "6. Correction des permissions"
chmod 644 .htaccess
chmod 644 server.js
chmod 644 backend/config/database.js
chmod 755 test_startup.js

if [ -d "node_modules" ]; then
    chmod -R 755 node_modules
fi

log_info "✅ Permissions corrigées"

# 7. Créer un script de redémarrage propre
log_step "7. Création d'un script de redémarrage"
cat > restart_app.sh << 'EOF'
#!/bin/bash

echo "🔄 REDÉMARRAGE LoftBarber"
echo "========================"

# Activer l'environnement Node.js
echo "Activation de l'environnement virtuel..."
source ~/nodevenv/public_html/loftbarber/20/bin/activate

if [ $? -ne 0 ]; then
    echo "❌ Impossible d'activer l'environnement virtuel"
    exit 1
fi

echo "✅ Environnement activé"

# Tester le démarrage
echo "Test de démarrage rapide..."
timeout 5s node test_startup.js

if [ $? -eq 0 ]; then
    echo "✅ Test réussi, redémarrage de l'application..."
    echo "Allez dans cPanel > Node.js Selector > Applications > LoftBarber > Restart"
    echo "Ou utilisez le bouton Restart dans l'interface"
else
    echo "❌ Test échoué, vérifiez les logs et les configurations"
    exit 1
fi
EOF

chmod +x restart_app.sh
log_info "✅ Script de redémarrage créé"

echo ""
echo "=========================================="
echo "🎯 CORRECTIONS APPLIQUÉES"
echo "=========================================="
echo ""
echo "✅ Configuration Passenger (.htaccess) corrigée"
echo "✅ Gestion d'erreurs globale ajoutée à server.js"
echo "✅ Configuration DB améliorée avec timeouts"
echo "✅ Script de test de démarrage créé"
echo "✅ Permissions corrigées"
echo "✅ Script de redémarrage créé"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Exécutez: ./restart_app.sh"
echo "2. Redémarrez l'app via cPanel > Node.js Selector > Restart"
echo "3. Testez: curl -I https://loft-barber.com/api/v1/health"
echo "4. Vérifiez les logs: tail -f ~/logs/loftbarber.log"
echo ""
echo "🔍 Si problème persiste, exécutez le diagnostic: ./diagnostic_o2switch_complete.sh"
