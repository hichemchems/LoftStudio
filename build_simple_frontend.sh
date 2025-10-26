#!/bin/bash

# Script simplifié pour builder le frontend avec options optimisées

echo "🏗️ Build simplifié du frontend React"

# Vérifier que nous sommes dans le répertoire frontend
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé. Allez dans le dossier frontend"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Variables d'environnement pour optimiser la mémoire
export NODE_OPTIONS="--max-old-space-size=512"
export VITE_BUILD_MEMORY_LIMIT=256

# Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
npm install --legacy-peer-deps --no-audit --no-fund

# Build avec options optimisées
echo "🏗️ Build du frontend (optimisé)..."
npx vite build --mode production --minify false --sourcemap false

if [ $? -ne 0 ]; then
    echo "❌ Build échoué, tentative avec configuration minimale..."
    # Essayer avec une configuration encore plus simple
    NODE_OPTIONS="--max-old-space-size=256" npx vite build --mode production --minify false
fi

if [ $? -ne 0 ]; then
    echo "❌ Build toujours échoué"
    echo "Création d'une version simplifiée..."

    # Créer une version HTML simple si le build échoue
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoftBarber - Salon</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .logo { font-size: 2em; color: #333; }
    </style>
</head>
<body>
    <h1 class="logo">🏪 LoftBarber</h1>
    <p>Site en construction - Bientôt disponible!</p>
</body>
</html>
EOF
    echo "✅ Version simplifiée créée"
else
    echo "✅ Build réussi!"
fi

# Vérifier le résultat
if [ -d "dist" ]; then
    echo "📁 Contenu du dossier dist:"
    ls -la dist/
fi
