#!/bin/bash

# Script pour builder le frontend localement et uploader sur o2switch

echo "🏗️ Build du frontend localement pour o2switch"

# Vérifier que nous sommes dans le répertoire frontend
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Êtes-vous dans le répertoire frontend ?"
    echo "Utilisation: cd ~/path/to/loftbarber/frontend && ./build_locally_fixed.sh"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"

# Vérifier que le script build existe
if ! npm run | grep -q "build"; then
    echo "❌ Script 'build' non trouvé dans package.json"
    echo "Scripts disponibles:"
    npm run
    exit 1
fi

# Build du frontend
echo "🏗️ Build du frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Frontend build réussi"

# Vérifier que le dossier dist existe
if [ -d "dist" ]; then
    echo "✅ Dossier dist créé avec succès"
    ls -la dist/
else
    echo "❌ Dossier dist non trouvé"
    exit 1
fi

echo ""
echo "📤 Instructions pour uploader sur o2switch:"
echo "1. Téléchargez le dossier 'dist' complet sur votre machine locale"
echo "2. Via FTP ou File Manager de cPanel, uploadez le contenu de 'dist' vers:"
echo "   ~/public_html/loftbarber/frontend/dist/"
echo "3. Redémarrez votre application Node.js dans cPanel"
echo ""
echo "🎉 Build local terminé! Maintenant uploadez le dossier dist sur o2switch."
