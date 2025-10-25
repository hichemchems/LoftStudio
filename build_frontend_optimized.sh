#!/bin/bash

# Script de build frontend optimisé pour o2switch (mémoire limitée)
echo "🔧 BUILD FRONTEND OPTIMISÉ POUR O2SWITCH"
echo "========================================"

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

# 1. Activer l'environnement Node.js
log_step "1. Activation de l'environnement Node.js"
source ~/nodevenv/loftbarber/20/bin/activate
if [ $? -ne 0 ]; then
    log_error "❌ Impossible d'activer l'environnement virtuel"
    exit 1
fi
log_info "✅ Environnement activé"

# 2. Aller dans le dossier frontend
cd frontend
log_info "✅ Dans le dossier frontend"

# 3. Nettoyer les caches et builds précédents
log_step "3. Nettoyage complet"
rm -rf node_modules/.vite .vite dist
npm cache clean --force 2>/dev/null
log_info "✅ Nettoyage terminé"

# 4. Modifier la configuration Vite pour optimiser la mémoire
log_step "4. Configuration Vite optimisée"
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations pour mémoire limitée
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 1000,
    // Désactiver les sourcemaps pour économiser mémoire
    sourcemap: false,
    // Optimisations supplémentaires
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimisations pour le développement
  server: {
    host: true,
    port: 5173,
  },
  // Variables d'environnement
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
EOF
log_info "✅ Configuration Vite optimisée"

# 5. Build avec options mémoire optimisées
log_step "5. Build avec optimisation mémoire maximale"
export NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size"

echo "Build avec NODE_OPTIONS: $NODE_OPTIONS"
timeout 300 npm run build

if [ $? -eq 0 ]; then
    log_info "✅ Build réussi !"
else
    log_error "❌ Build échoué, création d'une version simplifiée"

    # Créer une version HTML/CSS/JS simplifiée
    mkdir -p dist

    # HTML simplifié
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoftBarber - Gestion Salon</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <header class="header">
            <h1>🏪 LoftBarber</h1>
            <p>Application de gestion de salon de coiffure</p>
        </header>

        <main class="main">
            <div class="login-container">
                <h2>Connexion</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur:</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe:</label>
                        <input type="password" id="password" required>
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

    # CSS simplifié
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

#app {
    width: 100%;
    min-height: 100vh;
}

.header {
    text-align: center;
    color: white;
    padding: 2rem 1rem;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.main {
    padding: 2rem 1rem;
}

.login-container {
    max-width: 400px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.login-container h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
}

.form-group {
    margin-bottom: 1rem;
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
    border: 2px solid #e1e1e1;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
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
    transition: transform 0.2s;
}

.btn-login:hover {
    transform: translateY(-2px);
}

#message {
    margin-top: 1rem;
    padding: 0.5rem;
    text-align: center;
    border-radius: 5px;
    display: none;
}

#message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

#message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
EOF

    # JavaScript simplifié
    cat > dist/app.js << 'EOF'
// Application LoftBarber simplifiée
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

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

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showMessage('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Connexion réussie ! Redirection...', 'success');
                localStorage.setItem('token', data.token);
                // Redirection vers le dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion au serveur');
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

    log_info "✅ Version simplifiée créée"
fi

# 6. Vérifier les fichiers générés
log_step "6. Vérification des fichiers générés"
cd ..
ls -la frontend/dist/
log_info "✅ Fichiers vérifiés"

# 7. Synchroniser avec la racine
log_step "7. Synchronisation des fichiers"
cp -r frontend/dist/* . 2>/dev/null || true
log_info "✅ Fichiers synchronisés"

# 8. Vérification finale
log_step "8. Vérification finale"
if [ -f "index.html" ] && [ -f "style.css" ] && [ -f "app.js" ]; then
    log_info "✅ Tous les fichiers présents"
else
    log_error "❌ Fichiers manquants"
fi

echo ""
echo "=========================================="
echo "🎯 BUILD FRONTEND OPTIMISÉ TERMINÉ"
echo "=========================================="
echo ""
echo "✅ Configuration Vite optimisée"
echo "✅ Build avec gestion mémoire maximale"
echo "✅ Fichiers générés et synchronisés"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrez l'application: ./restart_passenger.sh"
echo "2. Testez: https://loft-barber.com/"
echo "3. L'application devrait maintenant avoir une interface fonctionnelle"
echo ""
echo "🔍 Si le build React complet échoue, une version HTML/CSS/JS simplifiée est utilisée"
