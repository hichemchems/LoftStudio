#!/bin/bash

# Script pour corriger le frontend sur o2switch avec gestion de la mémoire

echo "🔧 Correction du frontend LoftBarber pour o2switch (avec gestion mémoire)"

# Utiliser les binaires Node.js système
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"

# Augmenter les limites de mémoire pour Node.js
export NODE_OPTIONS="--max-old-space-size=256"

# Vérifier si nous sommes dans le répertoire frontend
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Êtes-vous dans le répertoire frontend ?"
    echo "Utilisation: cd ~/public_html/loftbarber/frontend && ./fix_frontend_memory_o2switch.sh"
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

# Build du frontend avec options de mémoire optimisées
echo "🏗️ Build du frontend (mémoire limitée)..."
NODE_OPTIONS="--max-old-space-size=256" npx vite build --mode production --minify false

if [ $? -ne 0 ]; then
    echo "❌ Build échoué même avec options réduites"
    echo "Création d'une page de maintenance temporaire..."
    # Créer un index.html minimal si le build échoue
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoftBarber - En maintenance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ LoftBarber</h1>
        <p>Le site est actuellement en cours de déploiement.</p>
        <p>L'application sera bientôt disponible.</p>
        <p><em>Build en cours sur o2switch...</em></p>
    </div>
</body>
</html>
EOF
    echo "✅ Page de maintenance créée dans dist/"
else
    echo "✅ Frontend build réussi"
fi

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
