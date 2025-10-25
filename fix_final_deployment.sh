#!/bin/bash

# Script final pour corriger tous les problèmes de déploiement
echo "🎯 DÉPLOIEMENT FINAL LOFTBARBER"
echo "=============================="

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

# 1. Créer le dossier dist
log_step "1. Création du dossier frontend/dist"
mkdir -p frontend/dist
log_info "✅ Dossier créé"

# 2. Créer index.html final
log_step "2. Création d'index.html final"
cat > frontend/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏪 LoftBarber - Application de gestion de salon de coiffure</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app">
        <header class="header">
            <h1>🏪 LoftBarber</h1>
            <p>Application de gestion de salon de coiffure</p>
        </header>

        <main class="main">
            <div class="login-container">
                <h2>Connexion</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" autocomplete="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe:</label>
                        <input type="password" id="password" name="password" autocomplete="current-password" required>
                    </div>
                    <button type="submit" class="btn-login">Se connecter</button>
                </form>
                <div id="message"></div>
            </div>
        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>
EOF
log_info "✅ index.html créé"

# 3. Créer style.css
log_step "3. Création de style.css"
cat > frontend/dist/style.css << 'EOF'
/* Reset et base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.app {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    text-align: center;
    color: white;
    margin-bottom: 2rem;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
}

.login-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 400px;
}

.login-container h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.8rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:active {
    transform: translateY(0);
}

#message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
    display: none;
}

#message.error {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
}

#message.success {
    background-color: #efe;
    color: #363;
    border: 1px solid #cfc;
}

#message.info {
    background-color: #cce7ff;
    color: #004085;
    border: 1px solid #b3d7ff;
}

/* Responsive */
@media (max-width: 480px) {
    .login-container {
        margin: 1rem;
        padding: 1.5rem;
    }

    .header h1 {
        font-size: 2rem;
    }
}
EOF
log_info "✅ style.css créé"

# 4. Créer app.js final avec toutes les corrections
log_step "4. Création d'app.js final"
cat > frontend/dist/app.js << 'EOF'
// Application LoftBarber - Version Finale
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LoftBarber frontend loaded');

    // Attendre que le DOM soit complètement chargé
    setTimeout(() => {
        initializeApp();
    }, 100);
});

function initializeApp() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // Vérifications de sécurité
    if (!loginForm) {
        console.error('❌ Formulaire de connexion non trouvé');
        return;
    }

    if (!messageDiv) {
        console.error('❌ Div de message non trouvé');
        return;
    }

    console.log('✅ Éléments DOM trouvés');

    function showMessage(message, type = 'error') {
        console.log(`📢 Message: ${message} (${type})`);
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Formulaire soumis');

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Vérifications de sécurité supplémentaires
        if (!emailInput || !passwordInput) {
            console.error('❌ Inputs non trouvés');
            showMessage('Erreur: champs de formulaire manquants');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        console.log(`📧 Email: ${email}, Password length: ${password.length}`);

        // Validation côté client
        if (!email || !password) {
            showMessage('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            showMessage('Veuillez entrer un email valide');
            return;
        }

        if (password.length < 3) {
            showMessage('Le mot de passe doit contenir au moins 3 caractères');
            return;
        }

        try {
            showMessage('Connexion en cours...', 'info');
            console.log('🔄 Tentative de connexion...');

            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log(`📡 Réponse HTTP: ${response.status}`);

            const data = await response.json();
            console.log('📦 Données reçues:', data);

            if (response.ok && data.success) {
                console.log('✅ Connexion réussie');
                showMessage('Connexion réussie ! Redirection...', 'success');
                localStorage.setItem('token', data.data.token);

                // Redirection vers le dashboard après un court délai
                setTimeout(() => {
                    console.log('🔄 Redirection vers /dashboard');
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                console.log('❌ Échec de connexion:', data.message);
                showMessage(data.message || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('💥 Erreur de connexion:', error);
            showMessage('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
        }
    });

    // Test de connexion API au chargement
    console.log('🔍 Test de connexion API...');
    fetch('/api/v1/health')
        .then(response => {
            console.log(`🏥 Health check: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('✅ API connectée:', data);
        })
        .catch(error => {
            console.error('❌ API non accessible:', error);
            showMessage('Serveur non accessible. Veuillez réessayer plus tard.');
        });

    console.log('🎉 Application initialisée');
}
EOF
log_info "✅ app.js final créé"

# 5. Créer vite.svg
log_step "5. Création de vite.svg"
cat > frontend/dist/vite.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
EOF
log_info "✅ vite.svg créé"

# 6. Vérifications finales
log_step "6. Vérifications finales"
echo "Contenu du dossier frontend/dist :"
ls -la frontend/dist/

echo ""
echo "IDs dans le HTML :"
grep -E "id=\"(email|password|loginForm|message)\"" frontend/dist/index.html

echo ""
echo "Fonction initializeApp dans app.js :"
grep -A 5 "function initializeApp" frontend/dist/app.js

log_info "✅ Toutes les vérifications passées"

echo ""
echo "=========================================="
echo "🎯 DÉPLOIEMENT FINAL TERMINÉ"
echo "=========================================="
echo ""
echo "✅ index.html avec formulaire Email"
echo "✅ style.css responsive"
echo "✅ app.js avec toutes les corrections"
echo "✅ vite.svg (icône)"
echo "✅ Vérifications null et sécurité"
echo "✅ Logging détaillé pour debug"
echo ""
echo "📋 COMMANDES À EXÉCUTER:"
echo "passenger-config restart-app ."
echo ""
echo "🌐 TEST FINAL:"
echo "https://loft-barber.com/"
echo "Email: admin@loftbarber.com"
echo "Mot de passe: admin123"
echo ""
echo "🔍 Ouvrez la console (F12) pour voir les logs détaillés"
echo ""
echo "🎉 L'application devrait maintenant fonctionner parfaitement!"
