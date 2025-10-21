# LoftBarber - Préparation Déploiement Production o2switch

## Vue d'ensemble
Préparer l'application LoftBarber pour le déploiement en production sur o2switch (hébergeur français supportant Node.js, MySQL, Docker).

## ✅ État Actuel
- Application fonctionnelle en développement avec Docker
- Backend Node.js/Express avec MySQL
- Frontend React/Vite
- Architecture conteneurisée

## 📋 Checklist Déploiement Production

### 1. Configuration Environnement Production
- [ ] Créer fichier `.env.production` avec variables sécurisées
- [ ] Configurer variables d'environnement o2switch :
  - `NODE_ENV=production`
  - `PORT=3001` (ou port assigné par o2switch)
  - `DB_HOST` (base MySQL o2switch)
  - `DB_PORT=3306`
  - `DB_NAME` (base de données o2switch)
  - `DB_USER` (utilisateur MySQL o2switch)
  - `DB_PASSWORD` (mot de passe MySQL o2switch)
  - `JWT_SECRET` (clé JWT sécurisée)
  - `JWT_EXPIRE=7d`
  - `BCRYPT_ROUNDS=12`
- [ ] Configurer domaine et SSL sur o2switch

### 2. Corrections Bugs Critiques (Avant Déploiement)
- [ ] Corriger syntaxe `EmployeeStats.js` (méthode `getStats` incomplète)
- [ ] Corriger `StatsService.js` (remplacer `consoNaN });` par `console.error`)
- [ ] Finaliser `InitializeEmployeeStats.js` (logique client tracking)
- [ ] Standardiser versions Node Docker (backend déjà en 20)
- [ ] Vérifier cohérence calculs stats entre contrôleurs

### 3. Optimisation Frontend Production
- [ ] Modifier `vite.config.js` pour production :
  - Configurer base URL pour domaine o2switch
  - Optimiser build (minification, tree-shaking)
  - Configurer proxy API pour production
- [ ] Mettre à jour `frontend/package.json` scripts build
- [ ] Tester build production localement : `npm run build && npm run preview`
- [ ] Optimiser images et assets statiques

### 4. Configuration Docker Production
- [ ] Créer `docker-compose.prod.yml` pour production :
  - Supprimer volumes locaux (utiliser stockage o2switch)
  - Configurer réseau production
  - Variables d'environnement production
  - Healthchecks pour monitoring
- [ ] Modifier `backend/Dockerfile` pour production :
  - Utiliser `npm ci --only=production`
  - Optimiser layers Docker
  - Configurer user non-root
- [ ] Modifier `frontend/Dockerfile` pour production :
  - Build en mode production
  - Servir fichiers statiques avec nginx léger
- [ ] Créer `Dockerfile.nginx` pour servir frontend en production

### 5. Base de Données Production
- [ ] Créer base de données MySQL sur o2switch
- [ ] Exécuter migrations et seeders en production
- [ ] Configurer sauvegardes automatiques o2switch
- [ ] Tester connexion base production
- [ ] Migrer données existantes si nécessaire

### 6. Scripts Déploiement
- [ ] Créer `deploy.sh` pour déploiement automatisé :
  - Build images Docker
  - Push vers registry o2switch (si disponible)
  - Déploiement rolling avec zéro downtime
  - Rollback automatique en cas d'erreur
- [ ] Créer `healthcheck.sh` pour monitoring santé app
- [ ] Configurer logs centralisés (o2switch logging)
- [ ] Scripts de backup base de données

### 7. Sécurité Production
- [ ] Configurer HTTPS obligatoire (Let's Encrypt via o2switch)
- [ ] Renforcer headers sécurité (Helmet.js déjà configuré)
- [ ] Rate limiting et protection DDoS
- [ ] Validation input renforcée
- [ ] Audit dépendances sécurité : `npm audit`
- [ ] Masquer erreurs détaillées en production
- [ ] Configurer CORS pour domaine production uniquement

### 8. Performance et Monitoring
- [ ] Optimiser requêtes base de données (indexes)
- [ ] Configurer cache Redis si disponible sur o2switch
- [ ] Monitoring applicatif (PM2 ou équivalent o2switch)
- [ ] Logs structurés avec Winston
- [ ] Alertes erreurs (email/slack)
- [ ] Métriques performance (response time, CPU, mémoire)

### 9. Tests Production
- [ ] Tests end-to-end en environnement similaire production
- [ ] Tests de charge basiques
- [ ] Validation données production
- [ ] Tests rollback et recovery

### 10. Documentation Déploiement
- [ ] Documenter procédure déploiement complet
- [ ] Guide maintenance et monitoring
- [ ] Runbook incidents
- [ ] Contacts support o2switch

## 🔄 Workflow Déploiement

### Phase 1: Préparation (1-2 semaines)
- Corrections bugs critiques
- Configuration environnement
- Tests locaux production

### Phase 2: Déploiement (2-3 jours)
- Setup o2switch (domaine, base, SSL)
- Déploiement initial
- Tests fonctionnels

### Phase 3: Validation (1 semaine)
- Monitoring 24/7
- Optimisations performance
- Corrections bugs production

### Phase 4: Mise en production (GO LIVE)
- Migration données finales
- Activation domaine public
- Monitoring post-lancement

## ⚠️ Points d'Attention o2switch
- Vérifier compatibilité Docker (version supportée)
- Limites ressources (CPU, RAM, stockage)
- Backup automatique disponible
- Support SSL/HTTPS
- Possibilité cron jobs pour tâches automatisées
- Logs d'accès disponibles

## 📞 Support et Rollback
- Plan B: rollback version précédente
- Contacts o2switch pour support technique
- Monitoring erreurs 24/7 première semaine

## ✅ Critères Go Live
- [ ] Application accessible via domaine HTTPS
- [ ] Base de données opérationnelle avec données
- [ ] Authentification fonctionnelle
- [ ] Dashboard admin opérationnel
- [ ] Tests utilisateurs validés
- [ ] Monitoring en place
- [ ] Sauvegardes configurées
