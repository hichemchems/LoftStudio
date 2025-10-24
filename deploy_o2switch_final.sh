#!/bin/bash

# Script de déploiement final pour o2switch
# Ce script gère le déploiement complet avec gestion des node_modules

echo "🚀 Déploiement LoftBarber vers o2switch..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'affichage des messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet LoftBarber"
    exit 1
fi

log_info "Vérification de la structure du projet..."
if [ ! -f "backend/package.json" ]; then
    log_error "package.json manquant dans backend/"
    exit 1
fi

# Créer le répertoire de déploiement
DEPLOY_DIR="deploy_temp"
if [ -d "$DEPLOY_DIR" ]; then
    log_warn "Suppression du répertoire de déploiement existant..."
    rm -rf "$DEPLOY_DIR"
fi

mkdir -p "$DEPLOY_DIR"
log_info "Répertoire de déploiement créé: $DEPLOY_DIR"

# Copier les fichiers backend (sans node_modules)
log_info "Copie des fichiers backend..."
cp -r backend/* "$DEPLOY_DIR/"
cp backend/.gitignore "$DEPLOY_DIR/" 2>/dev/null || true

# Supprimer les node_modules du déploiement si présents
if [ -d "$DEPLOY_DIR/node_modules" ]; then
    log_warn "Suppression de node_modules du package de déploiement..."
    rm -rf "$DEPLOY_DIR/node_modules"
fi

# Copier les fichiers frontend compilés
if [ -d "frontend/dist" ]; then
    log_info "Copie des fichiers frontend compilés..."
    mkdir -p "$DEPLOY_DIR/frontend"
    cp -r frontend/dist "$DEPLOY_DIR/frontend/"
else
    log_error "Frontend non compilé. Exécutez d'abord: cd frontend && npm run build"
    exit 1
fi

# Créer le fichier .htaccess pour Passenger
log_info "Création du fichier .htaccess pour Passenger..."
cat > "$DEPLOY_DIR/.htaccess" << 'EOF'
# Phusion Passenger configuration for Node.js
PassengerAppRoot /home/dije1636/public_html/loftbarber
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerFriendlyErrorPages on

# Enable rewrite engine
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /server.js [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

# Créer un script d'installation pour o2switch
log_info "Création du script d'installation pour o2switch..."
cat > "$DEPLOY_DIR/install_o2switch.sh" << 'EOF'
#!/bin/bash

echo "🔧 Installation LoftBarber sur o2switch..."

# Activer l'environnement Node.js
echo "Activation de l'environnement Node.js..."
source ~/nodevenv/public_html/loftbarber/20/bin/activate

# Installer les dépendances
echo "Installation des dépendances npm..."
npm install --production

# Vérifier l'installation
if [ $? -eq 0 ]; then
    echo "✅ Installation réussie!"
    echo "Redémarrez l'application via cPanel > Node.js Selector"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi
EOF

chmod +x "$DEPLOY_DIR/install_o2switch.sh"

# Créer l'archive de déploiement
ARCHIVE_NAME="loftbarber_deploy_$(date +%Y%m%d_%H%M%S).tar.gz"
log_info "Création de l'archive de déploiement: $ARCHIVE_NAME"
cd "$DEPLOY_DIR"
tar -czf "../$ARCHIVE_NAME" .
cd ..

# Calculer la taille de l'archive
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
log_info "Archive créée: $ARCHIVE_SIZE"

# Instructions finales
echo ""
echo "==============================================="
echo "🎉 PACKAGE DE DÉPLOIEMENT PRÊT!"
echo "==============================================="
echo ""
echo "📦 Archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo ""
echo "📋 INSTRUCTIONS D'UPLOAD:"
echo "1. Téléchargez l'archive $ARCHIVE_NAME"
echo "2. Via cPanel > File Manager, allez dans public_html/"
echo "3. Créez le dossier 'loftbarber' s'il n'existe pas"
echo "4. Upload l'archive dans public_html/loftbarber/"
echo "5. Extrayez l'archive dans le dossier loftbarber"
echo "6. Exécutez: chmod +x install_o2switch.sh && ./install_o2switch.sh"
echo ""
echo "🔧 CONFIGURATION NODE.JS SELECTOR:"
echo "- Application root: /home/dije1636/public_html/loftbarber"
echo "- Application URL: https://loft-barber.com"
echo "- Startup file: server.js"
echo "- Passenger log file: /home/dije1636/logs/passenger.log"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Les node_modules seront créés automatiquement par o2switch"
echo "- Ne copiez pas vos node_modules locaux"
echo "- Vérifiez les variables d'environnement dans cPanel"
echo ""
echo "🧪 TEST APRES DÉPLOIEMENT:"
echo "- Visitez https://loft-barber.com"
echo "- Vérifiez les logs: tail -f ~/logs/passenger.log"
echo ""

# Nettoyer le répertoire temporaire
log_info "Nettoyage du répertoire temporaire..."
rm -rf "$DEPLOY_DIR"

log_info "✅ Script terminé. Téléchargez $ARCHIVE_NAME et suivez les instructions ci-dessus."
