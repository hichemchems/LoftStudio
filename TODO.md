# TODO: Add Bar Charts to EmployeeDashboard

- [x] Import Bar and Chart.js components in EmployeeDashboard.jsx
- [x] Prepare chart data for totalPackages, totalClients, commission
- [x] Add Bar chart component below stats cards in JSX
- [x] Update EmployeeDashboard.css for chart container styling
- [x] Test dashboard to ensure charts render and update with period changes
- [x] Mark task as completed in TODO.md

# TODO: Configure Tests for Backend and Frontend

- [x] Backend: Create `backend/tests/` directory and add basic test files for API endpoints (e.g., auth routes, server startup) using Jest and Supertest
- [x] Frontend: Update `frontend/package.json` to add Jest, React Testing Library, and related dependencies; add a "test" script
- [x] Create test files: `backend/tests/server.test.js`, `backend/tests/auth.test.js`, `frontend/src/components/Login.test.jsx`, etc.
- [x] Install dependencies if needed
- [x] Run `npm test` in Docker containers to verify tests execute
- [ ] Add more comprehensive tests as needed

# TODO: Add Hamburger Menu to Dashboards

- [x] Add hamburger menu button to AdminDashboard header (right of logout button)
- [x] Create dropdown menu with navigation options: Dashboard Admin, Créer Employé, Gestion des Employés, Charges, Statistiques
- [x] Add hamburger menu button to EmployeeDashboard header (right of logout button)
- [x] Create dropdown menu with navigation options: Choisir Forfait, Voir Aujourd'hui, Voir Semaine, Voir Mois
- [x] Update dashboard CSS for menu styling and positioning
- [x] Test menu functionality and navigation
- [x] Mark task as completed in TODO.md

# TODO: Implement Package Selection Business Logic

- [x] Modify selectPackage in employeeController.js to create a Sale with TTC price when package selected
- [x] Update EmployeeDashboard.jsx to remove totalPackages stat card
- [x] Update EmployeeCard.jsx to display current period stats (package count, revenue HT, commission)
- [x] Update chart data in EmployeeDashboard to remove totalPackages
- [ ] Test the flow: select package -> creates sale -> updates employee stats HT -> updates admin turnover TTC -> employee card shows stats
- [x] Update TODO.md with completed tasks
