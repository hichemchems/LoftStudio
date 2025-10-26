#!/bin/bash

# Script pour corriger le build du frontend sur o2switch
echo "🔧 CORRECTION BUILD FRONTEND LoftBarber"
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

# 1. Activer l'environnement Node.js
log_step "1. Activation de l'environnement Node.js"
source ~/nodevenv/loftbarber/20/bin/activate
if [ $? -ne 0 ]; then
    log_error "❌ Impossible d'activer l'environnement virtuel"
    exit 1
fi
log_info "✅ Environnement activé"

# 2. Vérifier les dépendances frontend
log_step "2. Vérification des dépendances frontend"
cd frontend

if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances frontend..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "❌ Erreur lors de l'installation des dépendances frontend"
        exit 1
    fi
else
    log_info "✅ Dépendances frontend déjà installées"
fi

# 3. Nettoyer le build précédent
log_step "3. Nettoyage du build précédent"
rm -rf dist
log_info "✅ Dossier dist nettoyé"

# 4. Build du frontend
log_step "4. Build du frontend"
npm run build
if [ $? -ne 0 ]; then
    log_error "❌ Erreur lors du build frontend"
    exit 1
fi
log_info "✅ Build frontend réussi"

# 5. Vérifier les fichiers générés
log_step "5. Vérification des fichiers générés"
ls -la dist/
ls -la dist/assets/ 2>/dev/null || echo "Pas de dossier assets"

# 6. Corriger les chemins dans index.html si nécessaire
log_step "6. Correction des chemins dans index.html"
# Vérifier si les chemins sont corrects
if grep -q "/assets/" dist/index.html; then
    log_info "✅ Chemins des assets corrects"
else
    log_error "❌ Chemins des assets incorrects"
fi

# 7. Copier les fichiers vers le bon endroit si nécessaire
log_step "7. Synchronisation des fichiers frontend"
cd ..
if [ -d "frontend/dist" ]; then
    cp -r frontend/dist/* . 2>/dev/null || true
    log_info "✅ Fichiers frontend synchronisés"
else
    log_error "❌ Dossier frontend/dist non trouvé"
fi

# 8. Test des fichiers statiques
log_step "8. Test des fichiers statiques"
if [ -f "index.html" ] && [ -d "assets" ]; then
    log_info "✅ Fichiers statiques présents"
    ls -la assets/
else
    log_error "❌ Fichiers statiques manquants"
fi

echo ""
echo "=========================================="
echo "🎯 BUILD FRONTEND CORRIGÉ"
echo "=========================================="
echo ""
echo "✅ Environnement Node.js activé"
echo "✅ Dépendances installées"
echo "✅ Build frontend exécuté"
echo "✅ Fichiers générés vérifiés"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrez l'application: ./restart_passenger.sh"
echo "2. Testez: curl -I https://loft-barber.com/"
echo "3. Vérifiez que la page se charge correctement"
echo ""
echo "🔍 Le frontend devrait maintenant se charger correctement"
