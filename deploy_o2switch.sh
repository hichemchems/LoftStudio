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

# Vérifier que app.js existe (pour Passenger)
if [ ! -f "app.js" ]; then
    echo "❌ app.js non trouvé dans $BACKEND_DIR"
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

# Copier le build frontend vers la racine du projet (pour Passenger)
echo "📋 Copie du build frontend..."
mkdir -p "$APP_DIR/frontend/dist"
if [ -d "dist" ]; then
    cp -r dist/* "$APP_DIR/frontend/dist/"
    echo "✅ Frontend build copié vers $APP_DIR/frontend/dist/"
else
    echo "❌ Dossier dist non trouvé dans $FRONTEND_DIR"
    exit 1
fi

# Retour à la racine
cd "$APP_DIR"

echo "✅ Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes dans cPanel:"
echo "1. Allez dans 'Node.js' > 'Applications'"
echo "2. Sélectionnez l'application LoftBarber"
echo "3. Configurez le point d'entrée: backend/app.js"
echo "4. Cliquez sur 'Run NPM Install' si pas déjà fait"
echo "5. Redémarrez l'application"
echo "6. Vérifiez que l'URL https://loft-barber.com fonctionne"
echo ""
echo "🔧 Variables d'environnement à vérifier dans cPanel:"
echo "   - NODE_ENV: production"
echo "   - PASSENGER_APP_ENV: production"
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
echo ""
echo "⚠️ Note: Socket.io peut ne pas fonctionner avec Passenger."
echo "   Considérez utiliser des alternatives comme WebSockets natifs ou polling."
