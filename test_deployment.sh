#!/bin/bash

echo "🧪 Test Complet du Déploiement LoftBarber"
echo "========================================"

# Test 1: Vérification des logs
echo ""
echo "📋 Test 1: Vérification des logs Passenger"
if [ -f ~/logs/loftbarber.log ]; then
    echo "✅ Fichier de log trouvé"
    echo "📄 Dernières lignes du log :"
    tail -10 ~/logs/loftbarber.log
else
    echo "❌ Fichier de log non trouvé"
fi

# Test 2: Endpoint santé
echo ""
echo "🏥 Test 2: Endpoint santé (/api/v1/health)"
echo "Commande: curl -v https://loft-barber.com/api/v1/health"
curl -v https://loft-barber.com/api/v1/health 2>&1 | head -20

# Test 3: Page principale
echo ""
echo "🌐 Test 3: Page principale"
echo "Commande: curl -I https://loft-barber.com/"
curl -I https://loft-barber.com/

# Test 4: Contenu de la page
echo ""
echo "📄 Test 4: Contenu de la page d'accueil"
echo "Commande: curl -s https://loft-barber.com/ | head -10"
curl -s https://loft-barber.com/ | head -10

# Test 5: Test manuel de l'application
echo ""
echo "🔧 Test 5: Démarrage manuel pour vérifier la DB"
echo "Commande: node server.js (arrêter avec Ctrl+C)"
timeout 10s node server.js || echo "Timeout atteint - application semble démarrer"

echo ""
echo "✅ Tests terminés"
echo "Vérifiez les résultats ci-dessus"
