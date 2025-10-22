#!/bin/bash

echo "🚀 Déploiement LoftBarber - $(date)"

# Aller dans le répertoire du projet (o2switch cPanel path)
cd /home/dije1636/public_html/loftbarber

# Récupérer les dernières modifications
echo "📥 Pull des modifications..."
git pull origin main

# Installer les dépendances backend (production only)
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
echo "🔄 Redémarrage des services si nécessaire via cPanel..."
