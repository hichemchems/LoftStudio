#!/bin/bash

# Script de débogage pour o2switch utilisant l'environnement Node.js virtuel

echo "🔍 Débogage LoftBarber sur o2switch"
echo "=================================="

# Activer l'environnement Node.js virtuel
echo "🔧 Activation de l'environnement Node.js..."
source ~/nodevenv/public_html/loftbarber/20/bin/activate

if [ $? -ne 0 ]; then
    echo "❌ Impossible d'activer l'environnement Node.js virtuel"
    echo "Vérifiez que Node.js est configuré dans cPanel > Node.js Selector"
    exit 1
fi

echo "✅ Environnement Node.js activé"

# Vérifier les versions
echo "📋 Versions des outils:"
node --version
npm --version

# Vérifier les fichiers
echo "📁 Vérification des fichiers:"
if [ -f "server.js" ]; then
    echo "✅ server.js trouvé"
else
    echo "❌ server.js manquant"
fi

if [ -f "backend/app.js" ]; then
    echo "✅ backend/app.js trouvé"
else
    echo "❌ backend/app.js manquant"
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules trouvé"
else
    echo "❌ node_modules manquant"
fi

# Tester la syntaxe des fichiers
echo "🔍 Test de syntaxe des fichiers JavaScript:"
echo "Test server.js:"
node -c server.js
if [ $? -eq 0 ]; then
    echo "✅ Syntaxe server.js OK"
else
    echo "❌ Erreur de syntaxe dans server.js"
fi

echo "Test backend/app.js:"
node -c backend/app.js
if [ $? -eq 0 ]; then
    echo "✅ Syntaxe backend/app.js OK"
else
    echo "❌ Erreur de syntaxe dans backend/app.js"
fi

# Tester l'import des modules
echo "🔍 Test d'import des modules:"
node -e "
try {
    console.log('Test require express...');
    require('express');
    console.log('✅ Express OK');

    console.log('Test require sequelize...');
    require('sequelize');
    console.log('✅ Sequelize OK');

    console.log('Test import backend/models...');
    require('./backend/models');
    console.log('✅ Models OK');
} catch (error) {
    console.log('❌ Erreur d\'import:', error.message);
    process.exit(1);
}
"

# Vérifier les variables d'environnement
echo "🔧 Variables d'environnement:"
echo "NODE_ENV: $NODE_ENV"
echo "PASSENGER_APP_ENV: $PASSENGER_APP_ENV"
echo "DB_HOST: $DB_HOST"
echo "DB_USER: $DB_USER"
echo "DB_NAME: $DB_NAME"

# Vérifier les logs Passenger
echo "📋 Logs Passenger:"
if [ -f "~/logs/loftbarber.log" ]; then
    echo "Dernières lignes du log de l'application:"
    tail -20 ~/logs/loftbarber.log
else
    echo "⚠️ Log de l'application non trouvé: ~/logs/loftbarber.log"
fi

# Vérifier les logs système
echo "📋 Logs système:"
if [ -f "/home/$(whoami)/logs/error_log" ]; then
    echo "Dernières erreurs Apache:"
    tail -10 /home/$(whoami)/logs/error_log | grep -i loftbarber || echo "Aucune erreur LoftBarber récente"
else
    echo "⚠️ Log d'erreur Apache non trouvé"
fi

# Tester le démarrage de l'application
echo "🚀 Test de démarrage de l'application:"
timeout 10s node server.js &
APP_PID=$!
sleep 3

if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Application démarrée (PID: $APP_PID)"
    kill $APP_PID
else
    echo "❌ Application n'a pas pu démarrer"
fi

echo ""
echo "🎯 Résumé des vérifications terminées"
echo "Consultez les logs dans cPanel > Node.js > Applications > LoftBarber > Logs"
