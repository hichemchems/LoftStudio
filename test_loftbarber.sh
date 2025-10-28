#!/bin/bash

# Script de test pour LoftBarber sur o2switch
# À exécuter depuis le cPanel ou SSH

echo "🧪 Test de LoftBarber sur o2switch"
echo "=================================="
echo ""

DOMAIN="https://loft-barber.com"
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Fonction pour tester une URL
test_url() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3

    TEST_COUNT=$((TEST_COUNT + 1))
    echo -n "Test $TEST_COUNT: $description... "

    response=$(curl -s -I "$url" | head -1)
    status_code=$(echo "$response" | awk '{print $2}')

    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ PASS (Status: $status_code)"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ FAIL (Status: $status_code, Expected: $expected_status)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

# Fonction pour tester le contenu d'une URL
test_content() {
    local url=$1
    local expected_text=$2
    local description=$3

    TEST_COUNT=$((TEST_COUNT + 1))
    echo -n "Test $TEST_COUNT: $description... "

    content=$(curl -s "$url")
    if echo "$content" | grep -q "$expected_text"; then
        echo "✅ PASS"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ FAIL (Contenu non trouvé: $expected_text)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo "📡 Test des assets statiques..."
echo "-------------------------------"

# Test des assets JavaScript
test_url "$DOMAIN/assets/index.js" 200 "Asset index.js"
test_url "$DOMAIN/assets/vendor-Bag_gwg1.js" 200 "Asset vendor.js"
test_url "$DOMAIN/assets/router-BXlQiAzZ.js" 200 "Asset router.js"
test_url "$DOMAIN/assets/ui-C9wwLtAx.js" 200 "Asset ui.js"

# Test des assets CSS
test_url "$DOMAIN/assets/index.css" 200 "Asset index.css"

echo ""
echo "🏠 Test de la page principale..."
echo "-------------------------------"

# Test de la page d'accueil
test_url "$DOMAIN/" 200 "Page d'accueil"
test_content "$DOMAIN/" "LoftBarber" "Titre LoftBarber dans HTML"
test_content "$DOMAIN/" "/assets/index.js" "Référence au script principal"

echo ""
echo "🔗 Test du routing côté client..."
echo "-------------------------------"

# Test des routes SPA (devraient retourner la page HTML avec status 200)
test_url "$DOMAIN/login" 200 "Route /login"
test_url "$DOMAIN/dashboard" 200 "Route /dashboard"
test_url "$DOMAIN/admin" 200 "Route /admin"
test_url "$DOMAIN/employee" 200 "Route /employee"

echo ""
echo "🔌 Test des endpoints API..."
echo "-------------------------------"

# Test de l'endpoint health
test_url "$DOMAIN/api/v1/health" 200 "API Health"
test_content "$DOMAIN/api/v1/health" "LoftBarber API is running" "Message API health"

echo ""
echo "📊 Résultats des tests..."
echo "========================="
echo "Total des tests: $TEST_COUNT"
echo "✅ Réussis: $PASS_COUNT"
echo "❌ Échoués: $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 Tous les tests sont passés ! LoftBarber fonctionne correctement."
else
    echo ""
    echo "⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus."
fi

echo ""
echo "📝 Note: Les routes SPA (/login, /dashboard, etc.) retournent la page HTML"
echo "   principale car elles sont gérées côté client par React Router."
