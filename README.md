# LoftBarber - Système de Gestion de Salon de Coiffure

Un système complet de gestion pour salons de coiffure avec analyses en temps réel, gestion des employés et suivi financier.

## Fonctionnalités

- **Gestion des Utilisateurs** : Accès basé sur les rôles (SuperAdmin, Admin, Coiffeur)
- **Gestion des Forfaits** : Forfaits de services personnalisables avec tarification
- **Suivi des Ventes & Recettes** : Saisie en temps réel des ventes et recettes
- **Tableau de Bord Analytique** : Chiffre d'affaires, bénéfices et métriques de performance
- **Calcul des Salaires** : Génération automatique des salaires basée sur les commissions
- **Gestion des Dépenses** : Suivi et catégorisation des dépenses
- **Mises à Jour en Temps Réel** : Mises à jour du tableau de bord en direct avec Socket.io
- **Design Mobile-First** : Interface responsive optimisée pour les appareils mobiles

## Architecture

- **Backend** : Node.js/Express avec ORM Sequelize
- **Frontend** : React avec Vite
- **Base de Données** : MySQL
- **Conteneurisation** : Docker avec docker-compose

## Démarrage Rapide

### Prérequis
- Docker et Docker Compose
- Git

### Installation

1. Cloner le dépôt :
```bash
git clone <repository-url>
cd loftBarber
```

2. Démarrer l'application :
```bash
./start.sh
```

3. Accéder à l'application :
- Frontend : http://localhost:3000
- API Backend : http://localhost:3001
- Base de données : localhost:3307

### Comptes de Test

Après le démarrage, vous pouvez vous connecter 

## API Documentation

### Authentication
- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/logout - User logout

### Packages
- GET /api/v1/packages - Get all active packages
- POST /api/v1/packages - Create new package (Admin only)
- PUT /api/v1/packages/:id - Update package (Admin only)
- DELETE /api/v1/packages/:id - Deactivate package (Admin only)

### Users
- GET /api/v1/users - Get all users (Admin only)
- POST /api/v1/users - Create new user (Admin only)
- PUT /api/v1/users/:id - Update user (Admin only)

### Sales & Receipts
- GET /api/v1/employees/:id/sales - Get employee sales
- POST /api/v1/employees/:id/sales - Create sale
- POST /api/v1/employees/:id/receipts - Add receipt

### Analytics
- GET /api/v1/analytics/daily-turnover - Daily turnover
- GET /api/v1/analytics/monthly-turnover - Monthly turnover
- GET /api/v1/analytics/profit - Profit calculation

## Variables d'Environnement

Créer un fichier `.env` dans le répertoire backend :

```env
NODE_ENV=development
PORT=3001
DB_HOST=mysql
DB_PORT=3306
DB_NAME=**************
DB_USER=user
DB_PASSWORD=*******
JWT_SECRET=
JWT_EXPIRE=10d
BCRYPT_ROUNDS=********
```

## Développement

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Base de Données
La base de données MySQL est automatiquement configurée avec Docker Compose.

## Tests

```bash
# Tests backend
cd backend
npm test

# Tests frontend
cd frontend
npm test
```

## Déploiement

1. Construire et pousser les images Docker
2. Déployer sur votre plateforme cloud préférée
3. Configurer les variables d'environnement de production
4. Configurer les sauvegardes de base de données

## Sécurité

- Authentification JWT avec cookies sécurisés
- Hachage des mots de passe avec bcrypt
- Limitation du taux de requêtes et protection CSRF
- Validation et assainissement des entrées
- HTTPS en production

## Contribution

1. Forker le dépôt
2. Créer une branche de fonctionnalité
3. Faire vos modifications
4. Ajouter des tests
5. Soumettre une pull request

## Licence

Ce projet est sous licence MIT.
