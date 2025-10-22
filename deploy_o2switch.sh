#!/bin/bash

echo "🚀 Déploiement LoftBarber sur o2switch (cPanel) - $(date)"

# Variables (à adapter selon votre configuration o2switch)
APP_DIR="/home/dije1636/public_html/loftbarber"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NODE_ENV="production"

echo "📁 Répertoire de l'application: $APP_DIR"

# Vérifier que le répertoire existe
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Le répertoire $APP_DIR n'existe pas. Veuillez d'abord uploader les fichiers via cPanel ou FTP."
    exit 1
fi

cd "$APP_DIR"

# Installer les dépendances backend
echo "📦 Installation des dépendances backend..."
cd "$BACKEND_DIR"
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé dans $BACKEND_DIR"
    exit 1
fi
npm ci --only=production

# Vérifier que server.js existe
if [ ! -f "server.js" ]; then
    echo "❌ server.js non trouvé dans $BACKEND_DIR"
    exit 1
fi

# Build le frontend
echo "🔨 Build du frontend..."
cd "$FRONTEND_DIR"
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé dans $FRONTEND_DIR"
    exit 1
fi
npm ci --only=production
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist n'a pas été créé. Build frontend échoué."
    exit 1
fi

# Copier le build frontend vers le backend (si nécessaire pour servir statiquement)
echo "📋 Copie du build frontend..."
cp -r dist/* "$BACKEND_DIR/public/" 2>/dev/null || mkdir -p "$BACKEND_DIR/public" && cp -r dist/* "$BACKEND_DIR/public/"

# Retour à la racine
cd "$APP_DIR"

echo "✅ Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes dans cPanel:"
echo "1. Allez dans 'Node.js' > 'Applications'"
echo "2. Sélectionnez l'application LoftBarber"
echo "3. Cliquez sur 'Run NPM Install' si pas déjà fait"
echo "4. Redémarrez l'application"
echo "5. Vérifiez que l'URL https://loft-barber.com fonctionne"
echo ""
echo "🔧 Variables d'environnement à vérifier dans cPanel:"
echo "   - NODE_ENV: production"
echo "   - PORT: (port assigné par o2switch)"
echo "   - DB_HOST: (host MySQL o2switch)"
echo "   - DB_NAME: (nom base o2switch)"
echo "   - DB_USER: (user MySQL o2switch)"
echo "   - DB_PASSWORD: (password MySQL o2switch)"
echo "   - JWT_SECRET: (clé sécurisée)"
echo ""
echo "📊 Pour initialiser la base de données:"
echo "   cd $BACKEND_DIR && node scripts/initializeEmployeeStats.js"
echo "   cd $BACKEND_DIR && node database/seeders/sampleDataSeeder.js"
