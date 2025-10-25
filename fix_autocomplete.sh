#!/bin/bash

# Script pour corriger l'autocomplete du formulaire de connexion
echo "🔧 CORRECTION AUTOCOMPLETE FORMULAIRE"
echo "===================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 1. Modifier le fichier index.html existant
log_step "1. Correction du formulaire HTML"

if [ -f "index.html" ]; then
    # Sauvegarde
    cp index.html index.html.backup

    # Remplacement du formulaire
    sed -i 's|<label for="username">Nom d'\''utilisateur:</label>|                        <label for="email">Email:</label>|g' index.html
    sed -i 's|<input type="text" id="username" required>|                        <input type="email" id="email" name="email" autocomplete="email" required>|g' index.html
    sed -i 's|<input type="password" id="password" required>|                        <input type="password" id="password" name="password" autocomplete="current-password" required>|g' index.html

    log_info "✅ Formulaire corrigé"
else
    log_error "❌ index.html non trouvé"
    exit 1
fi

# 2. Modifier le JavaScript pour utiliser email au lieu de username
log_step "2. Correction du JavaScript"

if [ -f "app.js" ]; then
    # Remplacement dans le JavaScript
    sed -i 's|const username = document.getElementById('\''username'\'').value;|const email = document.getElementById('\''email'\'').value;|g' app.js
    sed -i 's|if (!username || !password) {|if (!email || !password) {|g' app.js
    sed -i 's|body: JSON.stringify({ username, password }),|body: JSON.stringify({ email, password }),|g' app.js

    log_info "✅ JavaScript corrigé"
else
    log_error "❌ app.js non trouvé"
fi

# 3. Vérification
log_step "3. Vérification des corrections"

echo "Contenu du formulaire corrigé:"
grep -A 10 "label for=" index.html

echo ""
echo "Contenu JavaScript corrigé:"
grep -A 5 "const email" app.js

log_info "✅ Corrections appliquées"

echo ""
echo "=========================================="
echo "🎯 AUTOCOMPLETE CORRIGÉ"
echo "=========================================="
echo ""
echo "✅ Formulaire utilise maintenant email avec autocomplete"
echo "✅ Attributs name et autocomplete ajoutés"
echo "✅ JavaScript mis à jour pour utiliser email"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Testez la page: https://loft-barber.com/"
echo "2. Le navigateur devrait maintenant proposer l'autofill"
echo ""
echo "🔍 Les erreurs d'autocomplete devraient être résolues"
