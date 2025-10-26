#!/bin/bash

# Script pour corriger la configuration environnementale sur o2switch

echo "🔧 Correction de la configuration LoftBarber pour o2switch"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "server.js" ]; then
    echo "❌ Erreur: server.js non trouvé. Êtes-vous dans le répertoire de l'application ?"
    exit 1
fi

echo "📍 Répertoire actuel: $(pwd)"

# Créer un fichier .env.production avec les bonnes variables
echo "📝 Création du fichier .env.production..."

cat > .env.production << 'EOF'
# Production environment variables for o2switch
NODE_ENV=production
PASSENGER_APP_ENV=production

# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dije1636_loft-barbe-db
DB_USER=dije1636_imad-coiffeur
DB_PASSWORD=YOUR_DB_PASSWORD_HERE

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# Application settings
PORT=3001
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=5242880

# Frontend URL (for CORS in production)
FRONTEND_URL=https://loft-barber.com
EOF

echo "✅ Fichier .env.production créé"

# Instructions pour l'utilisateur
echo ""
echo "🔑 Actions à effectuer dans cPanel:"
echo ""
echo "1. Allez dans cPanel > Node.js Selector > Applications"
echo "2. Sélectionnez votre application LoftBarber"
echo "3. Dans 'Environment variables', ajoutez/modifiez:"
echo ""
echo "   NODE_ENV=production"
echo "   PASSENGER_APP_ENV=production"
echo "   DB_HOST=localhost"
echo "   DB_PORT=3306"
echo "   DB_NAME=dije1636_loft-barbe-db"
echo "   DB_USER=dije1636_imad-coiffeur"
echo "   DB_PASSWORD=[votre_mot_de_passe_base_de_données]"
echo "   JWT_SECRET=[une_chaîne_sécurisée_aléatoire]"
echo ""
echo "4. Cliquez sur 'Restart' pour redémarrer l'application"
echo ""
echo "5. Vérifiez les logs dans cPanel > Node.js > Applications > LoftBarber > Logs"
echo ""

# Tester la configuration
echo "🧪 Test de la configuration locale..."
if command -v node &> /dev/null; then
    echo "Test des variables d'environnement:"
    node -e "
    require('dotenv').config({ path: '.env.production' });
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    "
else
    echo "⚠️ Node.js non disponible pour les tests locaux"
fi

echo ""
echo "✅ Configuration préparée!"
echo "Suivez les instructions ci-dessus pour finaliser la configuration dans cPanel."
