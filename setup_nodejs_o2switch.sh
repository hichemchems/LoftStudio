# Commandes pour configurer Node.js sur o2switch

# 1. Vérifier si Node.js est installé via cPanel
# Aller dans cPanel > Node.js Selector > Setup Node.js App

# 2. Créer l'application Node.js :
# - Application root: /home/dije1636/public_html/loftbarber
# - Application URL: /
# - Application startup file: backend/app.js
# - Passenger log file: /home/dije1636/logs/loftbarber.log

# 3. Installer les dépendances
cd ~/public_html/loftbarber
npm install

# 4. Variables d'environnement (ajouter dans cPanel)
# NODE_ENV=production
# PASSENGER_APP_ENV=production
# DB_HOST=localhost
# DB_USER=dije1636_loftbarber
# DB_PASSWORD=votre_mot_de_passe
# DB_NAME=dije1636_loftbarber
# JWT_SECRET=votre_secret_jwt

# 5. Redémarrer l'application
# Dans cPanel > Node.js > Applications > Restart

# 6. Vérifier que l'app fonctionne
curl -I https://votredomaine.com/api/v1/health

# 7. Si problème, vérifier les logs
tail -50 ~/logs/loftbarber.log
