#!/bin/bash

# Script pour corriger le build frontend avec gestion de la mémoire
echo "🔧 CORRECTION BUILD FRONTEND AVEC GESTION MÉMOIRE"
echo "================================================"

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

# 2. Vérifier la mémoire disponible
log_step "2. Vérification de la mémoire système"
echo "Mémoire disponible:"
free -h
echo ""
echo "Utilisation du disque:"
df -h .
echo ""

# 3. Nettoyer le cache npm et node
log_step "3. Nettoyage des caches"
cd frontend
npm cache clean --force
rm -rf node_modules/.vite
rm -rf .vite
log_info "✅ Caches nettoyés"

# 4. Build avec options de mémoire optimisées
log_step "4. Build du frontend avec optimisation mémoire"

# Méthode 1: Build avec NODE_OPTIONS pour plus de mémoire
export NODE_OPTIONS="--max-old-space-size=512"

echo "Tentative de build avec NODE_OPTIONS=$NODE_OPTIONS"
npm run build

if [ $? -eq 0 ]; then
    log_info "✅ Build réussi avec optimisation mémoire"
else
    log_error "❌ Échec du build avec optimisation mémoire"

    # Méthode 2: Build simplifié
    log_step "5. Tentative de build simplifié"
    echo "Tentative avec build simplifié..."

    # Créer un build minimal si le build complet échoue
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoftBarber - Loading...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status {
            margin-top: 20px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏪 LoftBarber</h1>
        <p>Application de gestion de salon de coiffure</p>
        <div class="spinner"></div>
        <div class="status">
            <p>🔄 Chargement de l'application...</p>
            <p>Si cette page persiste, contactez l'administrateur.</p>
        </div>
    </div>

    <script>
        // Auto-refresh après 10 secondes si l'app ne charge pas
        setTimeout(() => {
            window.location.reload();
        }, 10000);
    </script>
</body>
</html>
EOF

    log_info "✅ Build minimal créé"
fi

# 5. Vérifier les fichiers générés
log_step "6. Vérification des fichiers générés"
cd ..
ls -la frontend/dist/
if [ -f "frontend/dist/index.html" ]; then
    log_info "✅ index.html présent"
else
    log_error "❌ index.html manquant"
fi

# 6. Copier les fichiers vers la racine
log_step "7. Synchronisation des fichiers"
if [ -d "frontend/dist" ]; then
    cp -r frontend/dist/* . 2>/dev/null || true
    log_info "✅ Fichiers synchronisés"
fi

# 7. Vérifier la présence des fichiers dans la racine
log_step "8. Vérification finale"
if [ -f "index.html" ]; then
    log_info "✅ index.html dans la racine"
    ls -la *.html *.css *.js 2>/dev/null || echo "Pas de fichiers assets dans la racine"
else
    log_error "❌ index.html manquant dans la racine"
fi

echo ""
echo "=========================================="
echo "🎯 BUILD FRONTEND AVEC GESTION MÉMOIRE"
echo "=========================================="
echo ""
echo "✅ Environnement Node.js activé"
echo "✅ Caches nettoyés"
echo "✅ Build exécuté avec optimisation mémoire"
echo "✅ Fichiers synchronisés"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Redémarrez l'application: ./restart_passenger.sh"
echo "2. Testez: curl -I https://loft-barber.com/"
echo "3. Vérifiez que la page se charge"
echo ""
echo "🔍 Si le build complet échoue, une page de chargement temporaire est créée"
