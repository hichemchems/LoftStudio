# TODO: Fix Critical Bugs Before Production Deployment

## 2. Corrections Bugs Critiques (Avant Déploiement)
- [x] Corriger syntaxe `EmployeeStats.js` (méthode `getStats` incomplète)
- [x] Corriger `StatsService.js` (remplacer `consoNaN });` par `console.error`)
- [x] Finaliser `InitializeEmployeeStats.js` (logique client tracking)
- [x] Standardiser versions Node Docker (backend déjà en 20)
- [x] Vérifier cohérence calculs stats entre contrôleurs

## Additional Fixes Identified
- [x] Update dashboardController.js: Remove selected_package_id filtering for commission calculations, use sale.amount / 1.2 for HT price
- [x] Ensure employeeController.js uses consistent HT calculations
- [x] Standardize HT calculations in statsService.js and EmployeeStats.js
- [x] Update server.js for test mode: use different port to avoid conflicts
- [x] Adjust test expectations for CSRF endpoint in tests
