#!/bin/bash

# Script pour créer des logs admin et vérifier la base de données
echo "🔐 CRÉATION LOGS ADMIN ET VÉRIFICATION BDD"
echo "=========================================="

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

# 2. Créer un script pour seeder les données admin
log_step "2. Création du script de seeding admin"
cat > seed_admin.js << 'EOF'
const bcrypt = require('bcryptjs');
const { User, Employee } = require('./backend/models');
const { sequelize } = require('./backend/models');

async function createAdminUser() {
  try {
    console.log('🔐 Création de l\'utilisateur admin...');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({
      where: { email: 'admin@loftbarber.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin existe déjà:', existingAdmin.username);
      console.log('📧 Email: admin@loftbarber.com');
      console.log('🔑 Mot de passe: admin123');
      return existingAdmin;
    }

    // Créer l'admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@loftbarber.com',
      password_hash: adminPassword,
      role: 'admin',
      is_active: true
    });

    console.log('✅ Admin créé avec succès!');
    console.log('👤 Username: admin');
    console.log('📧 Email: admin@loftbarber.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('🎯 Rôle: admin');

    return admin;

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    throw error;
  }
}

async function listAllUsers() {
  try {
    console.log('\n📋 LISTE DE TOUS LES UTILISATEURS');
    console.log('================================');

    const users = await User.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.username}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🎯 Rôle: ${user.role}`);
      console.log(`   ✅ Actif: ${user.is_active ? 'Oui' : 'Non'}`);
      console.log(`   📅 Créé: ${user.created_at.toLocaleString('fr-FR')}`);

      if (user.employee) {
        console.log(`   💼 Employé: ${user.employee.name}`);
        console.log(`   📊 Pourcentage: ${user.employee.percentage}%`);
      }

      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Démarrage du script de gestion admin...\n');

    // Tester la connexion DB
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Créer l'admin
    await createAdminUser();

    // Lister tous les utilisateurs
    await listAllUsers();

    console.log('\n🎉 Script terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur dans le script:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
EOF

log_info "✅ Script de seeding créé"

# 3. Exécuter le script
log_step "3. Exécution du script admin"
node seed_admin.js

# 4. Nettoyer
log_step "4. Nettoyage"
rm seed_admin.js
log_info "✅ Nettoyage terminé"

echo ""
echo "=========================================="
echo "🔐 LOGS ADMIN CRÉÉS"
echo "=========================================="
echo ""
echo "✅ Utilisateur admin créé/vérifié"
echo "✅ Liste des utilisateurs affichée"
echo ""
echo "📋 IDENTIFIANTS ADMIN:"
echo "👤 Username: admin"
echo "📧 Email: admin@loftbarber.com"
echo "🔑 Mot de passe: admin123"
echo ""
echo "🌐 Testez la connexion sur: https://loft-barber.com/"
echo ""
echo "📝 Note: Utilisez ces identifiants pour vous connecter à l'application"
