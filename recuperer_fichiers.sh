#!/bin/bash

# Script pour récupérer et préparer les fichiers frontend pour l'upload

echo "📁 Récupération des fichiers frontend compilés..."

# Vérifier que nous sommes dans le répertoire du projet
if [ ! -d "frontend" ]; then
    echo "❌ Dossier 'frontend' non trouvé. Êtes-vous dans le répertoire racine du projet ?"
    exit 1
fi

# Vérifier que le dossier dist existe
if [ ! -d "frontend/dist" ]; then
    echo "❌ Dossier 'frontend/dist' non trouvé. Le frontend n'est pas compilé."
    echo "Exécutez d'abord : cd frontend && npm run build"
    exit 1
fi

echo "✅ Dossier frontend/dist trouvé"

# Créer un dossier temporaire pour l'upload
UPLOAD_DIR="upload_to_o2switch"
if [ -d "$UPLOAD_DIR" ]; then
    rm -rf "$UPLOAD_DIR"
fi

mkdir -p "$UPLOAD_DIR"

# Copier tous les fichiers
echo "📋 Copie des fichiers vers $UPLOAD_DIR..."
cp -r frontend/dist/* "$UPLOAD_DIR/"

echo "✅ Fichiers copiés avec succès"

# Afficher la structure
echo ""
echo "📁 Structure des fichiers à uploader :"
echo "====================================="
find "$UPLOAD_DIR" -type f -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "📊 Résumé :"
echo "- $(find "$UPLOAD_DIR" -name "*.html" | wc -l) fichier(s) HTML"
echo "- $(find "$UPLOAD_DIR" -name "*.css" | wc -l) fichier(s) CSS"
echo "- $(find "$UPLOAD_DIR" -name "*.js" | wc -l) fichier(s) JavaScript"
echo "- $(find "$UPLOAD_DIR" -name "*.svg" | wc -l) fichier(s) SVG"

echo ""
echo "🎯 Prochaines étapes :"
echo "1. Compresser le dossier '$UPLOAD_DIR' en ZIP"
echo "2. Télécharger le ZIP sur votre machine locale"
echo "3. Extraire le ZIP et uploader le contenu vers o2switch"
echo ""
echo "📂 Le dossier '$UPLOAD_DIR' contient tous les fichiers prêts pour l'upload."
