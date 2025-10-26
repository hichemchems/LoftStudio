const express = require('express');
const {
  getAnalytics,
  getAlerts,
  getSalesReport,
  getAnnualProfitReport,
  getProfitLossReport,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Routes
router.get('/', getAnalytics); // Main dashboard endpoint
router.get('/analytics', getAnalytics);
router.get('/alerts', getAlerts);
router.get('/reports/sales', getSalesReport);
router.get('/reports/annual-profit', getAnnualProfitReport);
router.get('/reports/profit-loss', getProfitLossReport);

// Expense management routes
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
