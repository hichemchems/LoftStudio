#!/bin/bash
echo "🚀 Déploiement LoftBarber sur o2switch - Commandes cPanel"
echo "======================================================"

echo ""
echo "1. NAVIGATION VERS VOTRE DOSSIER:"
echo "cd ~/public_html/loftbarber"
echo ""

echo "2. TÉLÉCHARGEMENT DES FICHIERS (depuis votre machine locale):"
echo "# Téléchargez upload_to_o2switch.zip depuis votre repo Git"
echo "# Puis uploadez-le via FTP ou File Manager vers ~/public_html/loftbarber/"
echo ""

echo "3. EXTRACTION DES FICHIERS:"
echo "unzip upload_to_o2switch.zip"
echo "cp -r upload_to_o2switch/* ."
echo "rm -rf upload_to_o2switch upload_to_o2switch.zip"
echo ""

echo "4. INSTALLATION DES DÉPENDANCES BACKEND:"
echo "npm install --production"
echo ""

echo "5. CRÉATION DE L'ADMIN UTILISATEUR:"
echo "node scripts/initAdmin.js"
echo ""

echo "6. REDÉMARRAGE DE L'APPLICATION:"
echo "passenger-config restart-app ."
echo ""

echo "7. VÉRIFICATION:"
echo "curl -s http://localhost/api/v1/health"
echo ""

echo "8. TEST LOGIN:"
echo "curl -X POST http://localhost/api/v1/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@loftbarber.com\",\"password\":\"admin123\"}'"
echo ""

echo "======================================================"
echo "🌐 URL DE VOTRE APPLICATION:"
echo "https://votre-domaine.com/"
echo ""
echo "🔑 IDENTIFIANTS PAR DÉFAUT:"
echo "Email: admin@loftbarber.com"
echo "Mot de passe: admin123"
echo "======================================================"
