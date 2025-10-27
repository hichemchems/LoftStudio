#!/bin/bash

# Script de thorough testing pour LoftBarber sur o2switch
# Ce script exécute tous les tests complets de l'application

echo "🧪 DÉBUT DES TESTS COMPLÈTS DE L'APPLICATION LOFTBARBER"
echo "======================================================"

# Couleurs pour les résultats
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

echo ""
echo "1. PRÉPARATION ET DÉPLOIEMENT"
echo "=============================="

cd ~/public_html/loftbarber
echo "📍 Répertoire: $(pwd)"

echo "🔄 Pull des changements..."
git pull origin main
check_status "Git pull"

echo "🔨 Build du frontend..."
./fix_frontend_o2switch.sh
check_status "Build frontend"

echo ""
echo "2. TEST DE L'ENVIRONNEMENT NODE.JS"
echo "==================================="

echo "🔍 Vérification Node.js..."
/opt/alt/alt-nodejs20/root/usr/bin/node --version
check_status "Node.js version"

echo "🚀 Démarrage du serveur..."
pkill -f "node server.js" 2>/dev/null
/opt/alt/alt-nodejs20/root/usr/bin/node server.js &
sleep 5

ps aux | grep -v grep | grep "node server.js" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Serveur démarré${NC}"
else
    echo -e "${RED}❌ Échec démarrage serveur${NC}"
fi

echo ""
echo "3. TESTS DES ENDPOINTS API (HEALTH & AUTH)"
echo "==========================================="

echo "🏥 Test Health Check..."
curl -s -I https://loft-barber.com/api/v1/health | head -1 | grep "200" > /dev/null
check_status "Health check (HTTP 200)"

curl -s https://loft-barber.com/api/v1/health | grep "success" > /dev/null
check_status "Health check (contenu valide)"

echo "🔐 Tests Auth endpoints..."
curl -s -I https://loft-barber.com/api/v1/auth/login | head -1 | grep "200\|404\|405" > /dev/null
check_status "Auth login endpoint"

curl -s -I https://loft-barber.com/api/v1/auth/register | head -1 | grep "200\|404\|405" > /dev/null
check_status "Auth register endpoint"

echo "🔑 Test login avec données..."
response=$(curl -s -X POST https://loft-barber.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loftbarber.com","password":"admin123"}')

echo "$response" | grep "token\|success" > /dev/null
check_status "Login avec credentials"

echo ""
echo "4. TESTS DES ASSETS STATIQUES"
echo "=============================="

echo "🎨 Tests fichiers CSS..."
assets_css=(
    "index-2m-1SyKW.css"
    "AdminDashboard-42Y35Y7W.css"
    "EmployeeDashboard-NVANQ5EU.css"
)

for asset in "${assets_css[@]}"; do
    curl -s -I "https://loft-barber.com/$asset" | head -1 | grep "200" > /dev/null
    check_status "CSS: $asset"
done

echo "📜 Tests fichiers JS..."
assets_js=(
    "index-DAsMN95_.js"
    "vendor-Bag_gwg1.js"
    "router-BXlQiAzZ.js"
    "ui-C9wwLtAx.js"
    "AdminDashboard-HYVI5MX3.js"
    "EmployeeDashboard-BU6ICT7Y.js"
    "Login-LVDPQARW.js"
    "Register-LLFELIO7.js"
)

for asset in "${assets_js[@]}"; do
    curl -s -I "https://loft-barber.com/$asset" | head -1 | grep "200" > /dev/null
    check_status "JS: $asset"
done

echo "🧩 Tests chunks JS..."
chunks=(
    "chunk-6MB7BHUF.js"
    "chunk-HTE5H7FZ.js"
    "chunk-JW4P4D2I.js"
    "chunk-P4B27ZJH.js"
)

for chunk in "${chunks[@]}"; do
    curl -s -I "https://loft-barber.com/$chunk" | head -1 | grep "200" > /dev/null
    check_status "Chunk: $chunk"
done

echo ""
echo "5. TESTS DE LA PAGE PRINCIPALE ET ROUTING"
echo "=========================================="

echo "🏠 Test page principale..."
curl -s -I https://loft-barber.com/ | head -1 | grep "200" > /dev/null
check_status "Page principale (HTTP 200)"

content=$(curl -s https://loft-barber.com/ | head -20)
echo "$content" | grep "<!DOCTYPE html>" > /dev/null
check_status "Contenu HTML valide"

echo "🧭 Tests routing client-side..."
routes=(
    "/login"
    "/dashboard"
    "/admin"
    "/employee"
)

for route in "${routes[@]}"; do
    curl -s -I "https://loft-barber.com$route" | head -1 | grep "200" > /dev/null
    check_status "Route: $route"
done

echo ""
echo "6. TESTS DES ENDPOINTS API SUPPLÉMENTAIRES"
echo "==========================================="

echo "👥 Tests endpoints utilisateurs..."
curl -s -I https://loft-barber.com/api/v1/users | head -1 | grep "200\|401\|404" > /dev/null
check_status "Users endpoint"

echo "📅 Tests endpoints réservations..."
curl -s -I https://loft-barber.com/api/v1/appointments | head -1 | grep "200\|401\|404" > /dev/null
check_status "Appointments endpoint"

echo "💇 Tests endpoints services..."
curl -s -I https://loft-barber.com/api/v1/services | head -1 | grep "200\|401\|404" > /dev/null
check_status "Services endpoint"

echo ""
echo "7. TESTS DE SÉCURITÉ ET HEADERS"
echo "==============================="

echo "🔒 Vérification headers de sécurité..."
security_headers=$(curl -s -I https://loft-barber.com/ | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Content-Security-Policy)" | wc -l)
if [ $security_headers -ge 3 ]; then
    echo -e "${GREEN}✅ Headers de sécurité présents${NC}"
else
    echo -e "${YELLOW}⚠️ Headers de sécurité incomplets${NC}"
fi

echo "🚫 Tests méthodes HTTP non autorisées..."
curl -s -X PUT https://loft-barber.com/api/v1/health | head -1 | grep "405\|404" > /dev/null
check_status "PUT method rejetée"

curl -s -X DELETE https://loft-barber.com/api/v1/health | head -1 | grep "405\|404" > /dev/null
check_status "DELETE method rejetée"

echo ""
echo "8. TESTS DE PERFORMANCE"
echo "======================="

echo "⚡ Test de charge léger..."
for i in {1..3}; do
    curl -s https://loft-barber.com/api/v1/health > /dev/null &
done
wait
echo -e "${GREEN}✅ Test de charge terminé${NC}"

echo "📏 Vérification tailles des réponses..."
api_size=$(curl -s https://loft-barber.com/api/v1/health | wc -c)
html_size=$(curl -s https://loft-barber.com/ | wc -c)

if [ $api_size -gt 10 ] && [ $html_size -gt 100 ]; then
    echo -e "${GREEN}✅ Tailles de réponses correctes (API: ${api_size}b, HTML: ${html_size}b)${NC}"
else
    echo -e "${RED}❌ Tailles de réponses suspectes${NC}"
fi

echo ""
echo "9. VÉRIFICATION DES LOGS ET DIAGNOSTICS"
echo "========================================"

echo "📋 Vérification permissions fichiers..."
assets_count=$(ls -la ~/public_html/loftbarber/ | grep -E '\.(css|js)$' | wc -l)
if [ $assets_count -gt 5 ]; then
    echo -e "${GREEN}✅ Assets présents (${assets_count} fichiers)${NC}"
else
    echo -e "${RED}❌ Peu d'assets trouvés${NC}"
fi

echo ""
echo "10. TEST DE REDÉMARRAGE ET STABILITÉ"
echo "====================================="

echo "🔄 Test de redémarrage..."
pkill -f "node server.js" 2>/dev/null
sleep 2
/opt/alt/alt-nodejs20/root/usr/bin/node server.js &
sleep 3

curl -s -I https://loft-barber.com/api/v1/health | head -1 | grep "200" > /dev/null
check_status "API après redémarrage"

curl -s -I https://loft-barber.com/ | head -1 | grep "200" > /dev/null
check_status "Page principale après redémarrage"

echo ""
echo "🎉 TESTS TERMINÉS"
echo "=================="
echo "Vérifiez les résultats ci-dessus. Les ❌ indiquent des problèmes à résoudre."
echo "Consultez les logs avec: tail -f ~/public_html/loftbarber/error.log"
