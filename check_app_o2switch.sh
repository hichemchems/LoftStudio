# Commandes pour vérifier l'application sur o2switch

# 1. Vérifier si Node.js est installé
node --version
npm --version

# 2. Vérifier si l'application Passenger est configurée
cd ~/public_html/loftbarber
ls -la

# 3. Vérifier les logs d'erreur Apache
tail -50 /home/$(whoami)/logs/error_log

# 4. Vérifier les logs d'accès Apache
tail -50 /home/$(whoami)/logs/access_log

# 5. Vérifier les logs de l'application Node.js (si configuré)
find /home/$(whoami) -name "*.log" -exec tail -20 {} \; 2>/dev/null | grep -i loftbarber || echo "No application logs found"

# 6. Tester la connectivité de l'application
curl -I https://votre-domaine.com/api/v1/health

# 7. Vérifier les processus Node.js en cours
ps aux | grep node

# 8. Vérifier la configuration Passenger
cat ~/public_html/loftbarber/server.js | head -20

# 9. Redémarrer l'application via cPanel
# Dans cPanel > Node.js > Applications > Sélectionner l'app > Restart

# 10. Vérifier les variables d'environnement
echo $NODE_ENV
echo $PASSENGER_APP_ENV
