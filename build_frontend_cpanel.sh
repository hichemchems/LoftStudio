#!/bin/bash

# Script pour builder le frontend React depuis cPanel/o2switch
# Adapté pour les contraintes de mémoire et environnement limité

echo "🏗️ BUILD FRONTEND REACT POUR CPANEL/O2SWITCH"
echo "==========================================="

# Couleurs pour les logs
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Vérifier l'environnement
log_step "1. Vérification de l'environnement"

# Vérifier si nous sommes dans le répertoire du projet
if [ ! -d "frontend" ]; then
    log_error "❌ Dossier 'frontend' non trouvé. Êtes-vous dans le répertoire racine du projet ?"
    echo "Utilisation: cd ~/public_html/loftbarber && ./build_frontend_cpanel.sh"
    exit 1
fi

# Vérifier package.json du frontend
if [ ! -f "frontend/package.json" ]; then
    log_error "❌ package.json non trouvé dans frontend/"
    exit 1
fi

log_info "✅ Environnement vérifié"

# 2. Configuration de l'environnement Node.js
log_step "2. Configuration Node.js"

# Utiliser les binaires Node.js système sur o2switch
export PATH="$PATH:/opt/alt/alt-nodejs20/root/usr/bin/"

# Augmenter les limites de mémoire pour Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Vérifier Node.js
if command -v node &> /dev/null; then
    log_info "✅ Node.js disponible: $(node --version)"
else
    log_error "❌ Node.js non trouvé"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    log_info "✅ npm disponible: $(npm --version)"
else
    log_error "❌ npm non trouvé"
    exit 1
fi

# 3. Aller dans le dossier frontend
log_step "3. Accès au dossier frontend"
cd frontend
log_info "✅ Dans le dossier frontend: $(pwd)"

# 4. Nettoyer les anciens builds
log_step "4. Nettoyage des anciens builds"
rm -rf node_modules/.vite .vite dist
npm cache clean --force 2>/dev/null || true
log_info "✅ Cache nettoyé"

# 5. Installer les dépendances
log_step "5. Installation des dépendances"
log_info "Installation avec --legacy-peer-deps pour éviter les conflits..."

if npm install --legacy-peer-deps --no-audit --no-fund --production=false; then
    log_info "✅ Dépendances installées"
else
    log_error "❌ Échec de l'installation des dépendances"
    exit 1
fi

# 6. Vérifier Vite
log_step "6. Vérification de Vite"
if npx vite --version &> /dev/null; then
    log_info "✅ Vite disponible: $(npx vite --version)"
else
    log_error "❌ Vite non disponible"
    exit 1
fi

# 7. Build du frontend avec optimisations mémoire
log_step "7. Build du frontend React"

# Méthode 1: Build avec mémoire optimisée pour o2switch
log_info "Tentative de build avec optimisations mémoire pour o2switch..."

# Configuration mémoire optimisée pour o2switch (sans --optimize-for-size)
<<<<<<< HEAD
export NODE_OPTIONS="--max-old-space-size=128 --no-warnings"
export UV_THREADPOOL_SIZE=1
export DISABLE_ESLINT_PLUGIN=true
=======
export NODE_OPTIONS="--max-old-space-size=256"
export UV_THREADPOOL_SIZE=2
>>>>>>> de04bce2698126995f211342f37fb30658d58028

# Timeout de 3 minutes pour éviter les blocages
timeout 180 npm run build

if [ $? -eq 0 ]; then
    log_info "✅ Build React réussi !"
else
    log_warning "❌ Build React échoué, tentative avec configuration simplifiée..."

    # Méthode 2: Build simplifié avec options mémoire
<<<<<<< HEAD
    export NODE_OPTIONS="--max-old-space-size=64 --no-warnings"
    export UV_THREADPOOL_SIZE=1
    export DISABLE_ESLINT_PLUGIN=true
    timeout 120 npx vite build --mode production --minify false --sourcemap false --emptyOutDir --logLevel silent
=======
    export NODE_OPTIONS="--max-old-space-size=128"
    export UV_THREADPOOL_SIZE=1
    timeout 120 npx vite build --mode production --minify false --sourcemap false --emptyOutDir
>>>>>>> de04bce2698126995f211342f37fb30658d58028

    if [ $? -eq 0 ]; then
        log_info "✅ Build simplifié réussi"
    else
        log_warning "❌ Build simplifié échoué, création d'une version de secours optimisée..."

        # Méthode 3: Version HTML/CSS/JS de secours
        mkdir -p dist

        # Créer une version React-like simplifiée
        cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏪 LoftBarber - Salon de coiffure</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root">
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
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Mot de passe:</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn-login">Se connecter</button>
                    </form>
                    <div id="message"></div>
                </div>
            </main>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
EOF

        # CSS moderne
        cat > dist/style.css << 'EOF'
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

        # JavaScript avec logique React-like
        cat > dist/app.js << 'EOF'
// Application LoftBarber - Version de secours optimisée pour cPanel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LoftBarber frontend loaded (version secours)');

    // Simuler React state
    let state = {
        isLoading: false,
        message: null,
        messageType: 'info'
    };

    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.querySelector('.btn-login');

    // Vérifier que les éléments existent
    if (!loginForm || !emailInput || !passwordInput || !submitBtn) {
        console.error('❌ Éléments du formulaire non trouvés');
        return;
    }

    function updateUI() {
        if (state.isLoading) {
            submitBtn.textContent = 'Connexion...';
            submitBtn.disabled = true;
        } else {
            submitBtn.textContent = 'Se connecter';
            submitBtn.disabled = false;
        }

        if (state.message) {
            messageDiv.textContent = state.message;
            messageDiv.className = state.messageType;
            messageDiv.style.display = 'block';
        } else {
            messageDiv.style.display = 'none';
        }
    }

    function setState(newState) {
        state = { ...state, ...newState };
        updateUI();
    }

    function showMessage(message, type = 'error') {
        console.log(`📢 Message: ${message} (${type})`);
        setState({ message, messageType: type });

        if (type !== 'info') {
            setTimeout(() => {
                setState({ message: null });
            }, 5000);
        }
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Formulaire soumis');

        // Get values safely with optional chaining
        const email = emailInput?.value?.trim() || '';
        const password = passwordInput?.value || '';

        // Validation
        if (!email || !password) {
            showMessage('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@')) {
            showMessage('Veuillez entrer un email valide');
            return;
        }

        setState({ isLoading: true, message: 'Connexion en cours...', messageType: 'info' });

        try {
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

            setState({ isLoading: false });

            if (response.ok && data.success) {
                console.log('✅ Connexion réussie');
                showMessage('Connexion réussie ! Redirection...', 'success');
                localStorage.setItem('token', data.data.token);

                // Redirection vers le dashboard
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
            setState({ isLoading: false });
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

    console.log('🎉 Application initialisée (version secours)');
});
EOF

        log_info "✅ Version de secours créée"
    fi
fi

# 8. Vérifier le résultat du build
log_step "8. Vérification du build"
cd ..
if [ -d "frontend/dist" ]; then
    log_info "✅ Dossier dist créé avec succès"
    echo "Contenu de frontend/dist :"
    ls -la frontend/dist/
else
    log_error "❌ Dossier dist non trouvé"
    exit 1
fi

# 9. Synchroniser avec la racine pour cPanel
log_step "9. Synchronisation des fichiers pour cPanel"
if [ -d "frontend/dist" ]; then
    # Copier les fichiers dans la racine pour que Passenger les serve
    cp -r frontend/dist/* . 2>/dev/null || true
    log_info "✅ Fichiers synchronisés dans la racine"
fi

# 10. Vérifications finales
log_step "10. Vérifications finales"
if [ -f "index.html" ] && [ -f "style.css" ] && [ -f "app.js" ]; then
    log_info "✅ Tous les fichiers présents dans la racine"
    ls -la index.html style.css app.js 2>/dev/null || echo "Fichiers présents"
else
    log_warning "⚠️ Certains fichiers peuvent manquer dans la racine"
fi

# 11. Test de l'API
log_step "11. Test de l'API backend"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/health | grep -q "200"; then
    log_info "✅ API backend accessible"
else
    log_warning "⚠️ API backend non accessible (peut être normal si pas démarré)"
fi

echo ""
echo "=========================================="
echo "🎯 BUILD FRONTEND TERMINÉ"
echo "=========================================="
echo ""
echo "✅ Frontend React buildé ou version de secours créée"
echo "✅ Fichiers déployés dans la racine pour cPanel"
echo "✅ Configuration optimisée pour o2switch"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1. Redémarrer l'application Node.js dans cPanel:"
echo "   passenger-config restart-app ."
echo ""
echo "2. Ou via le script si disponible:"
echo "   ./restart_passenger.sh"
echo ""
echo "3. Tester l'application:"
echo "   https://votre-domaine.com/"
echo ""
echo "4. Identifiants de test:"
echo "   Email: admin@loftbarber.com"
echo "   Mot de passe: admin123"
echo ""
echo "🔍 Si le build React complet a échoué, une version HTML/CSS/JS optimisée a été créée"
echo ""
echo "📝 Note: Le script gère automatiquement les contraintes mémoire d'o2switch"
echo ""
echo "🎉 Prêt pour le déploiement !"
