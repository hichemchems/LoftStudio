#!/bin/bash

# Script pour builder uniquement le frontend localement

echo "🏗️ Build du frontend React localement"

# Vérifier que nous sommes dans le répertoire du projet
if [ ! -d "frontend" ]; then
    echo "❌ Dossier 'frontend' non trouvé. Êtes-vous dans le répertoire racine du projet ?"
    echo "Utilisation: cd ~/path/to/loftbarber && ./build_frontend_locally.sh"
    exit 1
fi

# Aller dans le répertoire frontend
cd frontend

echo "📍 Répertoire actuel: $(pwd)"

# Vérifier que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé dans le dossier frontend"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances frontend..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"

# Vérifier que le script build existe
if ! npm run | grep -q "  build"; then
    echo "❌ Script 'build' non trouvé dans package.json du frontend"
    echo "Scripts disponibles:"
    npm run
    exit 1
fi

# Build du frontend
echo "🏗️ Build du frontend React..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi

echo "✅ Frontend React build réussi"

# Vérifier que le dossier dist existe
if [ -d "dist" ]; then
    echo "✅ Dossier dist créé avec succès"
    ls -la dist/ | head -10
else
    echo "❌ Dossier dist non trouvé"
    exit 1
fi

echo ""
echo "📤 Le frontend est prêt!"
echo "Le dossier 'dist' contient les fichiers à uploader sur o2switch."
echo ""
echo "📋 Instructions:"
echo "1. Téléchargez le dossier 'frontend/dist' sur votre machine locale"
echo "2. Uploadez son contenu vers ~/public_html/loftbarber/frontend/dist/ sur o2switch"
echo "3. Redémarrez l'application Node.js dans cPanel"
echo ""
echo "🎉 Build terminé avec succès!"
