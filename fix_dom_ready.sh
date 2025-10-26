#!/bin/bash

# Script pour corriger le problème de DOM non prêt
echo "🔧 CORRECTION DOM READY"
echo "======================="

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

# 1. Corriger app.js avec DOM ready garanti
log_step "1. Correction d'app.js avec DOM ready"
cat > frontend/dist/app.js << 'EOF'
// Application LoftBarber - DOM Ready Fix
(function() {
    'use strict';

    console.log('🚀 LoftBarber frontend starting...');

    // Fonction d'initialisation
    function initializeApp() {
        console.log('🎯 Initializing application...');

        const loginForm = document.getElementById('loginForm');
        const messageDiv = document.getElementById('message');

        // Vérifications critiques
        if (!loginForm) {
            console.error('❌ CRITICAL: loginForm not found!');
            console.log('Available elements:', document.querySelectorAll('[id]'));
            return;
        }

        if (!messageDiv) {
            console.error('❌ CRITICAL: messageDiv not found!');
            return;
        }

        console.log('✅ DOM elements found');

        function showMessage(message, type = 'error') {
            console.log(`📢 Showing message: ${message} (${type})`);
            messageDiv.textContent = message;
            messageDiv.className = type;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Form submitted');

            // Récupération sécurisée des éléments
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput) {
                console.error('❌ Email input not found');
                showMessage('Erreur: champ email manquant');
                return;
            }

            if (!passwordInput) {
                console.error('❌ Password input not found');
                showMessage('Erreur: champ mot de passe manquant');
                return;
            }

            const email = emailInput.value ? emailInput.value.trim() : '';
            const password = passwordInput.value || '';

            console.log(`📧 Attempting login for: ${email}`);

            // Validation
            if (!email) {
                showMessage('Veuillez saisir votre email');
                return;
            }

            if (!password) {
                showMessage('Veuillez saisir votre mot de passe');
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
                console.log('📦 Login response:', data);

                if (response.ok && data.success) {
                    showMessage('Connexion réussie !', 'success');
                    localStorage.setItem('token', data.data.token);

                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    showMessage(data.message || 'Identifiants incorrects');
                }
            } catch (error) {
                console.error('💥 Login error:', error);
                showMessage('Erreur de connexion');
            }
        });

        // Test API
        fetch('/api/v1/health')
            .then(r => r.json())
            .then(data => console.log('🏥 API Health:', data))
            .catch(err => console.error('❌ API Error:', err));

        console.log('🎉 Application initialized successfully');
    }

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM Content Loaded');
            setTimeout(initializeApp, 50);
        });
    } else {
        console.log('📄 DOM Already Ready');
        setTimeout(initializeApp, 50);
    }

    // Fallback au cas où
    window.addEventListener('load', function() {
        console.log('📄 Window Loaded');
        if (!window.appInitialized) {
            window.appInitialized = true;
            setTimeout(initializeApp, 50);
        }
    });

})();
EOF
log_info "✅ app.js corrigé avec DOM ready garanti"

# 2. Vérifier le HTML
log_step "2. Vérification du HTML"
if [ -f "frontend/dist/index.html" ]; then
    echo "IDs présents dans le HTML :"
    grep -o 'id="[^"]*"' frontend/dist/index.html | sort | uniq

    echo ""
    echo "Structure du formulaire :"
    grep -A 10 -B 2 "loginForm" frontend/dist/index.html
else
    log_error "❌ index.html non trouvé"
fi

# 3. Test de la structure
log_step "3. Test de la structure des fichiers"
echo "Contenu du dossier frontend/dist :"
ls -la frontend/dist/

echo ""
echo "Premières lignes d'app.js :"
head -20 frontend/dist/app.js

log_info "✅ Vérifications terminées"

echo ""
echo "=========================================="
echo "🎯 DOM READY CORRIGÉ"
echo "=========================================="
echo ""
echo "✅ Attente DOM ready garantie"
echo "✅ Vérifications null robustes"
echo "✅ Logging détaillé pour debug"
echo "✅ Fallback multiple pour l'initialisation"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrer Passenger: passenger-config restart-app ."
echo "2. Tester: https://loft-barber.com/"
echo "3. Ouvrir la console (F12) pour voir les logs"
echo ""
echo "🔍 L'erreur 'Cannot read properties of null' devrait être résolue"
echo ""
echo "💡 Si l'erreur persiste, les logs détaillés aideront à identifier le problème"
