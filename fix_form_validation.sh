#!/bin/bash

# Script pour corriger la validation du formulaire et permettre la connexion
echo "🔧 CORRECTION FORMULAIRE ET VALIDATION"
echo "====================================="

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

# 1. Modifier le fichier index.html pour corriger le formulaire
log_step "1. Correction du formulaire HTML"

if [ -f "index.html" ]; then
    # Sauvegarde
    cp index.html index.html.backup2

    # Remplacement complet du formulaire
    sed -i 's|<label for="username">Nom d'\''utilisateur:</label>|<label for="email">Email:</label>|g' index.html
    sed -i 's|<input type="text" id="username" required>|<input type="email" id="email" name="email" autocomplete="email" required>|g' index.html
    sed -i 's|<input type="password" id="password" required>|<input type="password" id="password" name="password" autocomplete="current-password" required>|g' index.html

    log_info "✅ Formulaire HTML corrigé"
else
    log_error "❌ index.html non trouvé"
    exit 1
fi

# 2. Modifier le JavaScript pour utiliser email et améliorer la validation
log_step "2. Correction du JavaScript"

if [ -f "app.js" ]; then
    # Remplacement du JavaScript complet
    cat > app.js << 'EOF'
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

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

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

    log_info "✅ JavaScript corrigé"
else
    log_error "❌ app.js non trouvé"
fi

# 3. Ajouter les styles pour les messages d'info
log_step "3. Ajout des styles pour les messages"

if [ -f "style.css" ]; then
    echo '
#message.info {
    background-color: #cce7ff;
    color: #004085;
    border: 1px solid #b3d7ff;
}' >> style.css

    log_info "✅ Styles ajoutés"
fi

# 4. Vérification
log_step "4. Vérification des corrections"

echo "Contenu du formulaire corrigé:"
grep -A 15 "form id=" index.html

echo ""
echo "Contenu JavaScript corrigé:"
grep -A 10 "const email" app.js

log_info "✅ Corrections appliquées"

echo ""
echo "=========================================="
echo "🎯 FORMULAIRE ET VALIDATION CORRIGÉS"
echo "=========================================="
echo ""
echo "✅ Formulaire utilise email avec validation"
echo "✅ Attributs autocomplete ajoutés"
echo "✅ JavaScript amélioré avec meilleure gestion d'erreurs"
echo "✅ Messages d'information ajoutés"
echo ""
echo "📋 IDENTIFIANTS DE TEST:"
echo "Email: admin@loftbarber.com"
echo "Mot de passe: admin123"
echo ""
echo "🌐 Testez la connexion sur: https://loft-barber.com/"
echo ""
echo "🔍 Le formulaire devrait maintenant accepter la connexion admin"
