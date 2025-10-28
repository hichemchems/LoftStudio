#!/bin/bash

# Script pour builder le frontend directement sur o2switch
echo "🏗️ Build du frontend React sur o2switch"

# Vérifier que nous sommes dans le répertoire du projet
if [ ! -d "frontend" ]; then
    echo "❌ Dossier 'frontend' non trouvé. Êtes-vous dans le répertoire racine du projet ?"
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

# Installer Node.js et npm si nécessaire (o2switch devrait les avoir)
echo "🔍 Vérification de Node.js et npm..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé sur ce serveur"
    echo "Contactez le support o2switch pour installer Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé sur ce serveur"
    echo "Contactez le support o2switch pour installer npm"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Installer les dépendances avec options compatibles o2switch
echo "📦 Installation des dépendances frontend..."
npm install --legacy-peer-deps --no-optional

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    echo "Tentative avec --force..."
    npm install --legacy-peer-deps --force --no-optional
    if [ $? -ne 0 ]; then
        echo "❌ Échec de l'installation même avec --force"
        exit 1
    fi
fi

echo "✅ Dépendances installées"

# Vérifier que le script build existe
if ! npm run | grep -q "  build"; then
    echo "❌ Script 'build' non trouvé dans package.json du frontend"
    echo "Scripts disponibles:"
    npm run
    exit 1
fi

# Build du frontend avec gestion mémoire pour o2switch
echo "🏗️ Build du frontend React (optimisé pour o2switch)..."
NODE_OPTIONS="--max-old-space-size=512" npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    echo "Tentative avec moins de mémoire..."
    NODE_OPTIONS="--max-old-space-size=256" npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Échec du build même avec mémoire réduite"
        exit 1
    fi
fi

echo "✅ Frontend React build réussi"

# Vérifier que le dossier dist existe
if [ -d "dist" ]; then
    echo "✅ Dossier dist créé avec succès"
    echo "📊 Contenu du dossier dist:"
    ls -la dist/ | head -15
    echo "📏 Taille totale: $(du -sh dist/)"
else
    echo "❌ Dossier dist non trouvé"
    exit 1
fi

echo ""
echo "📤 Le frontend est build et prêt!"
echo "Les fichiers sont dans 'frontend/dist' et utilisent les assets du sous-domaine statique."
echo ""
echo "📋 Prochaines étapes:"
echo "1. Copier le contenu de 'frontend/dist' vers '~/public_html/loftbarber/'"
echo "2. Vérifier que index.html charge les assets depuis static.loft-barber.com"
echo "3. Tester https://loft-barber.com"
echo ""
echo "🎉 Build terminé avec succès!"
