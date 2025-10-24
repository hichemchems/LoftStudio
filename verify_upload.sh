#!/bin/bash

# Script de vérification de l'upload des fichiers frontend

echo "🔍 Vérification de l'upload des fichiers frontend..."

# Vérifier si nous sommes sur o2switch (présence de ~/public_html)
if [ ! -d "~/public_html" ]; then
    echo "❌ Ce script doit être exécuté sur o2switch"
    echo "Utilisez-le via SSH sur votre serveur o2switch"
    exit 1
fi

DIST_DIR="~/public_html/loftbarber/frontend/dist"

echo "📍 Vérification du dossier: $DIST_DIR"

# Vérifier l'existence du dossier dist
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Dossier dist non trouvé: $DIST_DIR"
    echo "📋 Créez le dossier et uploadez les fichiers depuis frontend/dist/"
    exit 1
fi

echo "✅ Dossier dist trouvé"

# Vérifier les fichiers principaux
files_to_check=(
    "index.html"
    "vite.svg"
    "assets/index-CgW4wrZc.css"
    "assets/index-CgcuMKXJ.js"
)

all_files_present=true

for file in "${files_to_check[@]}"; do
    if [ -f "$DIST_DIR/$file" ]; then
        size=$(stat -f%z "$DIST_DIR/$file" 2>/dev/null || stat -c%s "$DIST_DIR/$file" 2>/dev/null)
        echo "✅ $file ($size octets)"
    else
        echo "❌ $file MANQUANT"
        all_files_present=false
    fi
done

echo ""
echo "📊 Résumé:"

if [ "$all_files_present" = true ]; then
    echo "✅ Tous les fichiers sont présents!"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "1. Redémarrez l'application Node.js dans cPanel"
    echo "2. Testez https://loft-barber.com"
    echo "3. Vous devriez voir l'application React complète"
else
    echo "❌ Certains fichiers sont manquants"
    echo ""
    echo "📤 Uploadez les fichiers manquants depuis votre machine locale:"
    echo "   Source: frontend/dist/"
    echo "   Destination: ~/public_html/loftbarber/frontend/dist/"
fi

echo ""
echo "🔍 Structure actuelle:"
ls -la "$DIST_DIR"
echo ""
ls -la "$DIST_DIR/assets" 2>/dev/null || echo "❌ Dossier assets manquant"
