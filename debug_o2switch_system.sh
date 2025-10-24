#!/bin/bash

# Script de débogage pour o2switch utilisant les binaires système Node.js

echo "🔍 Débogage LoftBarber sur o2switch (binaires système)"
echo "==================================================="

# Utiliser les binaires Node.js système d'o2switch
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"

echo "🔧 Utilisation des binaires Node.js système..."

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

# Tester la connexion à la base de données
echo "🗄️ Test de connexion à la base de données:"
node -e "
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie');
    return sequelize.close();
  })
  .then(() => console.log('✅ Connexion fermée'))
  .catch(error => {
    console.log('❌ Erreur de connexion à la base de données:', error.message);
    console.log('Vérifiez vos variables d\'environnement DB_*');
  });
"

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
