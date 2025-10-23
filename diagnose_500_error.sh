# Script pour diagnostiquer l'erreur 500 sur o2switch

# 1. Vérifier les logs de l'application
tail -50 ~/logs/loftbarber.log

# 2. Vérifier les logs d'erreur Apache
find /home -name "error_log" -exec tail -20 {} \; 2>/dev/null

# 3. Tester l'application manuellement
cd ~/public_html/loftbarber/backend
node -e "console.log('Node.js fonctionne'); process.exit(0);"

# 4. Vérifier les variables d'environnement
echo "Variables d'environnement définies :"
env | grep -E "(NODE_ENV|DB_|JWT_)" | sort

# 5. Tester la connexion à la base de données
cd ~/public_html/loftbarber/backend
node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});
sequelize.authenticate().then(() => {
  console.log('Connexion DB réussie');
  process.exit(0);
}).catch(err => {
  console.error('Erreur DB:', err.message);
  process.exit(1);
});
"

# 6. Vérifier si les dépendances sont installées
cd ~/public_html/loftbarber
ls -la node_modules/ | head -10

# 7. Tester le démarrage de l'application
cd ~/public_html/loftbarber/backend
timeout 10s node app.js &
sleep 5
ps aux | grep node
kill %1 2>/dev/null
