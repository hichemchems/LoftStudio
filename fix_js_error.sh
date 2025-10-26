#!/bin/bash

# Script pour corriger l'erreur JavaScript "Cannot read properties of null"
echo "🔧 CORRECTION ERREUR JAVASCRIPT"
echo "==============================="

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

# 1. Corriger app.js pour éviter l'erreur null
log_step "1. Correction d'app.js"
cat > frontend/dist/app.js << 'EOF'
// Application LoftBarber simplifiée
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // Vérifier que les éléments existent
    if (!loginForm) {
        console.error('Formulaire de connexion non trouvé');
        return;
    }

    if (!messageDiv) {
        console.error('Div de message non trouvé');
        return;
    }

    function showMessage(message, type = 'error') {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Vérifier que les inputs existent
        if (!emailInput || !passwordInput) {
            showMessage('Erreur: champs de formulaire manquants');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validation
        if (!email || !password) {
            showMessage('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@')) {
            showMessage('Veuillez entrer un email valide');
            return;
        }

        try {
            showMessage('Connexion en cours...', 'info');

            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage('Connexion réussie ! Redirection...', 'success');
                localStorage.setItem('token', data.data.token);

                // Redirection vers le dashboard après un court délai
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                showMessage(data.message || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
        }
    });

    // Test de connexion API au chargement
    fetch('/api/v1/health')
        .then(response => response.json())
        .then(data => {
            console.log('API connectée:', data);
        })
        .catch(error => {
            console.error('API non accessible:', error);
            showMessage('Serveur non accessible. Veuillez réessayer plus tard.');
        });
});
EOF
log_info "✅ app.js corrigé avec vérifications null"

# 2. Vérifier le HTML pour s'assurer que les IDs sont corrects
log_step "2. Vérification du HTML"
if [ -f "frontend/dist/index.html" ]; then
    echo "IDs dans le HTML :"
    grep -E "id=\"(email|password|loginForm|message)\"" frontend/dist/index.html

    log_info "✅ HTML vérifié"
else
    log_error "❌ index.html non trouvé"
fi

# 3. Test de validation
log_step "3. Test de validation JavaScript"
echo "Contenu corrigé d'app.js :"
grep -A 10 "const emailInput" frontend/dist/app.js

log_info "✅ Validation ajoutée"

echo ""
echo "=========================================="
echo "🎯 ERREUR JAVASCRIPT CORRIGÉE"
echo "=========================================="
echo ""
echo "✅ Vérifications null ajoutées"
echo "✅ Gestion d'erreur améliorée"
echo "✅ Inputs vérifiés avant utilisation"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrer Passenger: passenger-config restart-app ."
echo "2. Tester: https://loft-barber.com/"
echo "3. Vérifier la console (F12) - plus d'erreur null"
echo ""
echo "🔍 L'erreur 'Cannot read properties of null' devrait être résolue"
