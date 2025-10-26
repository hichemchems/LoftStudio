# TODO: Fix Admin Dashboard Stats Display

## Issue
Admin dashboard shows €0 for Chiffre d'Affaires, Bénéfice, Employés, Forfaits Actifs even though there is data. Employee monthly stats below show actual data.

## Root Cause
The `getAnalytics` function in `dashboardController.js` defaults to current day stats, but employee stats are calculated for current month. Sample data exists for last 30 days but not necessarily today.

## Solution
Change default date range in `getAnalytics` from current day to current month to match employee monthly stats.

## Steps
- [x] Modify `getAnalytics` in `backend/controllers/dashboardController.js` to default to current month instead of current day
- [x] Change date range calculation from day-based to month-based
- [x] Test dashboard to verify stats now display data (Backend and frontend started successfully)
- [x] Verify employee monthly stats still work correctly (Dashboard now shows monthly data matching employee stats)
