# TODO: Implémentation de la réinitialisation automatique des statistiques employé

## Étape 1: Créer la table des statistiques cumulatives
- [ ] Créer une migration SQL pour ajouter une table `employee_stats` avec colonnes:
  - id (PK)
  - employee_id (FK)
  - daily_total_packages, daily_total_clients, daily_total_revenue, daily_commission
  - weekly_total_packages, weekly_total_clients, weekly_total_revenue, weekly_commission
  - monthly_total_packages, monthly_total_clients, monthly_total_revenue, monthly_commission
  - last_updated (timestamp)
- [ ] Créer le modèle Sequelize pour EmployeeStats

## Étape 2: Créer un service de mise à jour des statistiques
- [ ] Créer un service `statsService.js` avec fonctions:
  - updateDailyStats(): calcule et stocke les stats du jour, ajoute à la semaine, reset daily à 0
  - updateWeeklyStats(): ajoute la semaine au mois, reset weekly à 0
  - initializeStatsForEmployee(): initialise les stats à 0 pour un nouvel employé

## Étape 3: Implémenter le scheduler pour les réinitialisations automatiques
- [ ] Créer un script `statsScheduler.js` qui:
  - S'exécute tous les jours à 00:00:00 pour updateDailyStats
  - S'exécute tous les dimanches à 00:00:00 pour updateWeeklyStats
  - Utilise node-cron pour la planification

## Étape 4: Modifier le contrôleur employeeController.js
- [ ] Modifier `getEmployeeStats` pour retourner les stats cumulatives depuis la table employee_stats
- [ ] Ajouter logique pour calculer les vraies stats quand nécessaire (pour vérification)

## Étape 5: Mettre à jour le frontend si nécessaire
- [ ] Vérifier si le frontend a besoin de modifications pour afficher les stats cumulatives

## Étape 6: Migration des données existantes
- [ ] Créer un script pour initialiser les stats cumulatives pour tous les employés existants basé sur les ventes/réçus actuels

## Étape 7: Tests et validation
- [ ] Tester la réinitialisation quotidienne
- [ ] Tester la réinitialisation hebdomadaire
- [ ] Vérifier que les stats s'affichent correctement dans le dashboard
