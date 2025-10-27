#!/bin/bash

# Script pour corriger le frontend sur o2switch

# Activer le logging des erreurs
exec > >(tee -a fix_frontend.log) 2>&1

echo "🔧 Correction du frontend LoftBarber pour o2switch"
echo "📝 Logs enregistrés dans fix_frontend.log"

# Utiliser les binaires Node.js système
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"

# Vérifier si nous sommes dans le répertoire frontend
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erreur: package.json du frontend non trouvé. Êtes-vous dans le répertoire racine du projet ?"
    echo "Utilisation: ./fix_frontend_o2switch.sh depuis le répertoire loftbarber"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Aller dans le répertoire frontend
cd frontend

# Installer les dépendances (legacy-peer-deps configuré dans .npmrc)
echo "📦 Installation des dépendances frontend..."
npm install

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

# Build du frontend avec options de mémoire optimisées et fallback
echo "🏗️ Build du frontend..."
NODE_OPTIONS="--max-old-space-size=64" npm run build

if [ $? -ne 0 ]; then
    echo "⚠️ Build avec 64MB échoué, tentative avec 32MB..."
    NODE_OPTIONS="--max-old-space-size=32" npm run build
fi

if [ $? -ne 0 ]; then
    echo "⚠️ Build avec 32MB échoué, tentative avec configuration minimale..."
    NODE_OPTIONS="--max-old-space-size=16" npx vite build --mode production --minify false
fi

if [ $? -ne 0 ]; then
    echo "⚠️ Build minimal échoué, tentative avec esbuild..."
    NODE_OPTIONS="--max-old-space-size=16" npx esbuild src/main.jsx --bundle --outfile=dist/assets/index.js --format=esm --minify=false
fi

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

# Copier les fichiers dans le répertoire racine pour le déploiement
echo "📋 Copie des fichiers pour le déploiement..."
cp -r dist/* ../
echo "✅ Fichiers copiés dans le répertoire racine"

echo ""
echo "📝 Vérifiez le fichier fix_frontend.log pour les détails complets des erreurs"
