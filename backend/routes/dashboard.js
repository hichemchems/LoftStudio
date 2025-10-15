const express = require('express');
const {
  getAnalytics,
  getAlerts,
  getSalesReport,
  getProfitLossReport
} = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Routes
router.get('/analytics', getAnalytics);
router.get('/alerts', getAlerts);
router.get('/reports/sales', getSalesReport);
router.get('/reports/profit-loss', getProfitLossReport);

module.exports = router;
