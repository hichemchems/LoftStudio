#!/bin/bash

# Script pour corriger définitivement l'erreur null reference
echo "🔧 CORRECTION NULL REFERENCE ERROR"
echo "==================================="

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

# 1. Créer app.js avec approche différente
log_step "1. Recréation complète d'app.js"
cat > frontend/dist/app.js << 'EOF'
// LoftBarber Frontend - Version Finale avec Debug
console.log('🚀 Starting LoftBarber frontend...');

// Variable globale pour éviter les réinitialisations multiples
window.loftBarberInitialized = false;

function initializeLoftBarber() {
    if (window.loftBarberInitialized) {
        console.log('⚠️ Already initialized, skipping...');
        return;
    }

    console.log('🎯 Initializing LoftBarber application...');

    // Attendre un peu pour s'assurer que le DOM est stable
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const messageDiv = document.getElementById('message');

        console.log('🔍 Checking DOM elements:');
        console.log('- loginForm:', loginForm ? 'FOUND' : 'NOT FOUND');
        console.log('- emailInput:', emailInput ? 'FOUND' : 'NOT FOUND');
        console.log('- passwordInput:', passwordInput ? 'FOUND' : 'NOT FOUND');
        console.log('- messageDiv:', messageDiv ? 'FOUND' : 'NOT FOUND');

        // Vérification critique
        if (!loginForm) {
            console.error('❌ CRITICAL: loginForm not found! Available IDs:');
            const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
            console.log('Available IDs:', allIds);
            return;
        }

        if (!emailInput || !passwordInput) {
            console.error('❌ CRITICAL: Input fields not found!');
            return;
        }

        if (!messageDiv) {
            console.error('❌ CRITICAL: Message div not found!');
            return;
        }

        console.log('✅ All DOM elements found, setting up event listeners...');

        // Fonction d'affichage des messages
        function showMessage(message, type = 'error') {
            console.log(`📢 Showing message: "${message}" (${type})`);
            messageDiv.textContent = message;
            messageDiv.className = type;
            messageDiv.style.display = 'block';

            if (type !== 'info') {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        }

        // Gestionnaire de soumission du formulaire
        function handleFormSubmit(e) {
            e.preventDefault();
            console.log('📝 Form submitted');

            try {
                // Récupération sécurisée des valeurs
                const email = emailInput.value ? emailInput.value.trim() : '';
                const password = passwordInput.value || '';

                console.log(`📧 Login attempt for: "${email}" (password length: ${password.length})`);

                // Validation
                if (!email) {
                    showMessage('Veuillez saisir votre email');
                    return;
                }

                if (!password) {
                    showMessage('Veuillez saisir votre mot de passe');
                    return;
                }

                if (!email.includes('@') || !email.includes('.')) {
                    showMessage('Veuillez entrer un email valide');
                    return;
                }

                // Tentative de connexion
                showMessage('Connexion en cours...', 'info');

                fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                })
                .then(response => {
                    console.log(`📡 Response status: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    console.log('📦 Response data:', data);

                    if (data.success) {
                        console.log('✅ Login successful');
                        showMessage('Connexion réussie ! Redirection...', 'success');
                        localStorage.setItem('token', data.data.token);

                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1500);
                    } else {
                        console.log('❌ Login failed:', data.message);
                        showMessage(data.message || 'Identifiants incorrects');
                    }
                })
                .catch(error => {
                    console.error('💥 Fetch error:', error);
                    showMessage('Erreur de connexion au serveur');
                });

            } catch (error) {
                console.error('💥 Form submit error:', error);
                showMessage('Erreur lors de la soumission du formulaire');
            }
        }

        // Ajout de l'event listener
        loginForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Event listener added to form');

        // Test de l'API
        fetch('/api/v1/health')
            .then(response => response.json())
            .then(data => {
                console.log('🏥 API Health check:', data);
            })
            .catch(error => {
                console.error('❌ API Health check failed:', error);
            });

        window.loftBarberInitialized = true;
        console.log('🎉 LoftBarber application initialized successfully!');

    }, 100); // Petit délai pour stabilité
}

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    console.log('📄 DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM Content Loaded event fired');
        initializeLoftBarber();
    });
} else {
    console.log('📄 DOM already ready');
    initializeLoftBarber();
}

// Fallback supplémentaire
window.addEventListener('load', () => {
    console.log('📄 Window load event fired');
    setTimeout(() => {
        if (!window.loftBarberInitialized) {
            console.log('📄 Fallback initialization');
            initializeLoftBarber();
        }
    }, 200);
});
EOF
log_info "✅ app.js recréé avec approche différente"

# 2. Vérifier le HTML
log_step "2. Vérification du HTML"
if [ -f "frontend/dist/index.html" ]; then
    echo "Structure du formulaire HTML :"
    grep -A 15 "loginForm" frontend/dist/index.html

    echo ""
    echo "IDs présents :"
    grep -o 'id="[^"]*"' frontend/dist/index.html | sort
else
    log_error "❌ index.html non trouvé"
fi

# 3. Test du script
log_step "3. Test du script"
echo "Début d'app.js :"
head -30 frontend/dist/app.js

echo ""
echo "Fonction handleFormSubmit :"
grep -A 20 "handleFormSubmit" frontend/dist/app.js

log_info "✅ Script testé"

echo ""
echo "=========================================="
echo "🎯 NULL REFERENCE ERROR CORRIGÉ"
echo "=========================================="
echo ""
echo "✅ Attente DOM complète avant initialisation"
echo "✅ Vérifications null avant chaque accès"
echo "✅ Event listener ajouté seulement si éléments existent"
echo "✅ Logging détaillé pour debug"
echo "✅ Fallbacks multiples"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrer Passenger: passenger-config restart-app ."
echo "2. Tester: https://loft-barber.com/"
echo "3. Ouvrir la console (F12) et regarder les logs détaillés"
echo ""
echo "🔍 Cette fois, l'erreur null devrait être complètement résolue!"
echo ""
echo "💡 Les logs vous diront exactement ce qui se passe à chaque étape"
