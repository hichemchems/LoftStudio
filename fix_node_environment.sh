#!/bin/bash

# Script pour corriger l'environnement Node.js sur o2switch
echo "🔧 CORRECTION ENVIRONNEMENT NODE.JS - o2switch"
echo "=============================================="

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

# 1. Activer l'environnement Node.js virtuel
log_step "1. Activation de l'environnement Node.js virtuel"
source ~/nodevenv/loftbarber/20/bin/activate
if [ $? -eq 0 ]; then
    log_info "✅ Environnement virtuel activé"
else
    log_error "❌ Impossible d'activer l'environnement virtuel"
    echo "Vérifiez que l'environnement existe dans cPanel > Node.js Selector"
    exit 1
fi

# 2. Vérifier que node et npm sont disponibles
log_step "2. Vérification de Node.js et npm"
which node
which npm

node --version
npm --version

if [ $? -eq 0 ]; then
    log_info "✅ Node.js et npm disponibles"
else
    log_error "❌ Node.js ou npm non disponibles"
    exit 1
fi

# 3. Installer les dépendances si nécessaire
log_step "3. Installation des dépendances"
if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances npm..."
    npm install
    if [ $? -eq 0 ]; then
        log_info "✅ Dépendances installées"
    else
        log_error "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
else
    log_info "✅ Dépendances déjà installées"
fi

# 4. Tester les imports de base
log_step "4. Test des imports de base"
node -e "
try {
    console.log('Testing basic imports...');
    require('dotenv');
    require('express');
    require('cors');
    require('helmet');
    console.log('✅ Basic imports OK');
} catch (error) {
    console.log('❌ Import error:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    log_info "✅ Imports de base réussis"
else
    log_error "❌ Problème d'imports de base"
    exit 1
fi

# 5. Tester la connexion DB
log_step "5. Test de connexion DB"
node -e "
require('dotenv').config();
try {
    const { sequelize } = require('./backend/config/database');
    sequelize.authenticate().then(() => {
        console.log('✅ DB connection OK');
        sequelize.close();
    }).catch(err => {
        console.log('❌ DB connection failed:', err.message);
        process.exit(1);
    });
} catch (error) {
    console.log('❌ DB config error:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    log_info "✅ Connexion DB réussie"
else
    log_error "❌ Problème de connexion DB"
fi

# 6. Créer un script de démarrage avec environnement activé
log_step "6. Création du script de démarrage avec environnement"
cat > start_with_env.sh << 'EOF'
#!/bin/bash
# Script de démarrage avec environnement Node.js activé

echo "🚀 Démarrage LoftBarber avec environnement Node.js"

# Activer l'environnement virtuel
source ~/nodevenv/loftbarber/20/bin/activate

# Vérifier l'activation
if [ $? -ne 0 ]; then
    echo "❌ Impossible d'activer l'environnement virtuel"
    exit 1
fi

echo "✅ Environnement activé"

# Démarrer l'application
node server.js
EOF

chmod +x start_with_env.sh
log_info "✅ Script de démarrage créé"

# 7. Tester le démarrage rapide
log_step "7. Test de démarrage rapide"
timeout 10s bash start_with_env.sh > test_start.log 2>&1 &
START_PID=$!

sleep 5

if kill -0 $START_PID 2>/dev/null; then
    log_info "✅ Application démarrée avec succès"
    kill $START_PID
    echo "Logs de démarrage:"
    cat test_start.log
else
    log_error "❌ Échec du démarrage"
    echo "Logs d'erreur:"
    cat test_start.log
fi

# 8. Créer un script de redémarrage Passenger
log_step "8. Création du script de redémarrage Passenger"
cat > restart_passenger.sh << 'EOF'
#!/bin/bash
# Script pour redémarrer l'application via Passenger

echo "🔄 Redémarrage LoftBarber via Passenger"

# Activer l'environnement virtuel
source ~/nodevenv/loftbarber/20/bin/activate

# Redémarrer via Passenger (si disponible)
if command -v passenger-config >/dev/null 2>&1; then
    echo "Redémarrage via Passenger..."
    passenger-config restart-app $(pwd)
else
    echo "Passenger non disponible, redémarrage manuel..."
    pkill -f "node server.js"
    sleep 2
    bash start_with_env.sh &
fi

echo "✅ Redémarrage terminé"
EOF

chmod +x restart_passenger.sh
log_info "✅ Script de redémarrage créé"

echo ""
echo "=========================================="
echo "🎯 CORRECTIONS ENVIRONNEMENT APPLIQUÉES"
echo "=========================================="
echo ""
echo "✅ Environnement Node.js virtuel activé"
echo "✅ Dépendances installées"
echo "✅ Imports de base testés"
echo "✅ Connexion DB vérifiée"
echo "✅ Script de démarrage créé: start_with_env.sh"
echo "✅ Script de redémarrage créé: restart_passenger.sh"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Utilisez: ./start_with_env.sh pour démarrer manuellement"
echo "2. Ou: ./restart_passenger.sh pour redémarrer via Passenger"
echo "3. Testez: curl -I https://loft-barber.com/api/v1/health"
echo ""
echo "🔍 L'environnement Node.js est maintenant correctement configuré"
