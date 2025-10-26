#!/bin/bash

# Script de déploiement complet pour o2switch
echo "🚀 DÉPLOIEMENT COMPLET LOFTBARBER SUR O2SWITCH"
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Vérifier l'environnement
log_step "1. Vérification de l'environnement"
if [ ! -d ".git" ]; then
    log_error "❌ Pas dans un dépôt Git"
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_error "❌ package.json non trouvé"
    exit 1
fi

log_info "✅ Environnement vérifié"

# 2. Nettoyer les fichiers de production existants
log_step "2. Nettoyage des fichiers de production"
log_warning "Suppression des fichiers de production existants..."

# Liste des fichiers à supprimer (ancienne version statique)
files_to_remove=(
    "index.html"
    "style.css"
    "app.js"
    "vite.svg"
    "assets/"
    "frontend/dist/index.html"
    "frontend/dist/style.css"
    "frontend/dist/app.js"
    "frontend/dist/vite.svg"
    "frontend/dist/assets/"
)

for file in "${files_to_remove[@]}"; do
    if [ -e "$file" ]; then
        rm -rf "$file"
        log_info "✅ Supprimé: $file"
    fi
done

log_info "✅ Fichiers de production nettoyés"

# 3. Git pull
log_step "3. Mise à jour du code depuis Git"
log_info "Récupération des dernières modifications..."

if git pull origin main; then
    log_info "✅ Code mis à jour"
else
    log_error "❌ Échec du git pull"
    exit 1
fi

# 4. Configuration Node.js pour o2switch
log_step "4. Configuration Node.js"
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"
export NODE_OPTIONS="--max-old-space-size=512"

# Vérifier Node.js
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    log_info "✅ Node.js disponible: $(node --version)"
else
    log_error "❌ Node.js non disponible"
    exit 1
fi

# 5. Installer les dépendances backend
log_step "5. Installation des dépendances backend"
if npm install --legacy-peer-deps --production=false; then
    log_info "✅ Dépendances backend installées"
else
    log_error "❌ Échec installation backend"
    exit 1
fi

# 6. Build du frontend
log_step "6. Build du frontend React"
if [ -f "build_frontend_cpanel.sh" ]; then
    chmod +x build_frontend_cpanel.sh
    if ./build_frontend_cpanel.sh; then
        log_info "✅ Frontend buildé"
    else
        log_error "❌ Échec du build frontend"
        exit 1
    fi
else
    log_error "❌ Script build_frontend_cpanel.sh non trouvé"
    exit 1
fi

# 7. Vérifications finales
log_step "7. Vérifications finales"
files_to_check=(
    "index.html"
    "assets/index-CgcuMKXJ.js"
    "assets/index-CgW4wrZc.css"
    "server.js"
    "backend/app.js"
)

all_good=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        log_info "✅ Présent: $file"
    else
        log_error "❌ Manquant: $file"
        all_good=false
    fi
done

if [ "$all_good" = false ]; then
    log_error "❌ Certains fichiers sont manquants"
    exit 1
fi

# 8. Redémarrage de l'application
log_step "8. Redémarrage de l'application"
if command -v passenger-config &> /dev/null; then
    log_info "Redémarrage avec Passenger..."
    passenger-config restart-app .
    log_info "✅ Application redémarrée"
else
    log_warning "⚠️ Passenger non disponible, redémarrage manuel requis"
    echo "Exécutez: passenger-config restart-app ."
fi

echo ""
echo "=========================================="
echo "🎯 DÉPLOIEMENT TERMINÉ"
echo "=========================================="
echo ""
echo "✅ Code mis à jour depuis Git"
echo "✅ Anciens fichiers supprimés"
echo "✅ Dépendances installées"
echo "✅ Frontend React buildé"
echo "✅ Application redémarrée"
echo ""
echo "🌐 Testez l'application:"
echo "https://votre-domaine.com/"
echo ""
echo "🔍 Identifiants de test:"
echo "Email: admin@loftbarber.com"
echo "Mot de passe: admin123"
echo ""
echo "📝 Si des problèmes persistent:"
echo "1. Vérifiez les logs: ~/.passenger/logs/"
echo "2. Redémarrez manuellement: passenger-config restart-app ."
echo ""
echo "🎉 Déploiement réussi !"
