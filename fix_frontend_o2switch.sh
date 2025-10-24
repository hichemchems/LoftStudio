#!/bin/bash

# Script pour corriger le frontend sur o2switch

echo "🔧 Correction du frontend LoftBarber pour o2switch"

# Utiliser les binaires Node.js système
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"

# Vérifier si nous sommes dans le répertoire frontend
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Êtes-vous dans le répertoire frontend ?"
    echo "Utilisation: cd ~/public_html/loftbarber/frontend && ./fix_frontend_o2switch.sh"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Installer les dépendances avec --legacy-peer-deps pour éviter les conflits
echo "📦 Installation des dépendances frontend..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées"

# Vérifier que Vite est installé
echo "🔍 Vérification de Vite..."
npx vite --version

if [ $? -ne 0 ]; then
    echo "❌ Vite n'est pas disponible"
    exit 1
fi

echo "✅ Vite est disponible"

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
echo "🎉 Frontend prêt!"
echo "Le dossier dist a été créé et peut être servi par le backend."
