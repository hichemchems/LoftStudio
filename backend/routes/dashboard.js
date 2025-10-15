const express = require('express');
const {
  getDashboardOverview,
  getSalesAnalytics,
  getProfitAnalytics,
  getEmployeePerformance,
  getMonthlyReport
} = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Routes
router.get('/overview', getDashboardOverview);
router.get('/sales-analytics', getSalesAnalytics);
router.get('/profit-analytics', getProfitAnalytics);
router.get('/employee-performance', getEmployeePerformance);
router.get('/monthly-report/:year/:month', getMonthlyReport);

module.exports = router;
