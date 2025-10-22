#!/bin/bash

echo "🚀 Déploiement LoftBarber - $(date)"

# Aller dans le répertoire du projet
cd /home/dije1636/www/loftbarber

# Récupérer les dernières modifications
echo "📥 Pull des modifications..."
git pull origin main

# Installer les dépendances backend
echo "📦 Installation dépendances backend..."
cd backend
npm ci --only=production

# Build le frontend
echo "🔨 Build frontend..."
cd ../frontend
npm ci --only=production
npm run build

# Retour à la racine
cd ..

echo "✅ Déploiement terminé avec succès!"
echo "🔄 Redémarrage des services si nécessaire..."
