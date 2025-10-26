# Commandes corrigées pour o2switch

# 1. Vérifier les chemins des logs (différents selon l'hébergement)
find /home -name "error_log" 2>/dev/null | head -5
find /home -name "access_log" 2>/dev/null | head -5

# 2. Vérifier si Passenger est configuré
cd ~/public_html/loftbarber
cat server.js | grep -A 5 "PhusionPassenger"

# 3. Vérifier la configuration Node.js dans cPanel
# Aller dans cPanel > Node.js Selector > Applications

# 4. Démarrer l'application manuellement (si nécessaire)
cd ~/public_html/loftbarber/backend
node app.js &

# 5. Tester avec le bon domaine (remplacez par votre domaine réel)
curl -I https://loft-barber.com/api/v1/health

# 6. Vérifier les variables d'environnement Passenger
echo $PASSENGER_APP_ENV
echo $NODE_ENV

# 7. Vérifier si l'app est dans la liste des apps Node.js
# Dans cPanel: Node.js > Applications > voir si loftbarber est listé

# 8. Redémarrer via Passenger (méthode recommandée)
# Dans cPanel: Node.js > Applications > Restart pour loftbarber
