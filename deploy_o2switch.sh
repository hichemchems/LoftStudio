#!/bin/bash

# Script de déploiement pour o2switch
# À exécuter sur le serveur o2switch via SSH

echo "🚀 Déploiement LoftBarber sur o2switch"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "server.js" ]; then
    echo "❌ Erreur: server.js non trouvé. Êtes-vous dans le répertoire de l'application ?"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées"
else
    echo "✅ Dépendances déjà installées"
fi

# Vérifier la configuration Node.js dans cPanel
echo "🔍 Vérification de la configuration Node.js..."
echo "Assurez-vous que dans cPanel > Node.js Selector > Applications:"
echo "  - Application root: $(pwd)"
echo "  - Application URL: /"
echo "  - Application startup file: server.js"
echo "  - Passenger log file: ~/logs/loftbarber.log"
echo ""

# Variables d'environnement recommandées
echo "🔧 Variables d'environnement à configurer dans cPanel:"
echo "NODE_ENV=production"
echo "PASSENGER_APP_ENV=production"
echo "DB_HOST=localhost"
echo "DB_USER=$(whoami)_loftbarber"
echo "DB_PASSWORD=[votre_mot_de_passe_db]"
echo "DB_NAME=$(whoami)_loftbarber"
echo "JWT_SECRET=[votre_secret_jwt]"
echo ""

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
echo "Allez dans cPanel > Node.js > Applications > Sélectionnez LoftBarber > Restart"
echo ""

# Tester l'application
echo "🧪 Test de l'application..."
sleep 3

# Test de santé
echo "Test de l'endpoint santé:"
curl -s https://loft-barber.com/api/v1/health || echo "❌ API non accessible"

# Test de la page principale
echo "Test de la page principale:"
curl -s -I https://loft-barber.com/ | head -1 || echo "❌ Page principale non accessible"

echo ""
echo "✅ Déploiement terminé!"
echo "Vérifiez les logs dans cPanel > Node.js > Applications > LoftBarber > Logs"
echo "Si vous avez des erreurs, consultez ~/logs/loftbarber.log"
