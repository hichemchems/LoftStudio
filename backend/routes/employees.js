const express = require('express');
const { body } = require('express-validator');
const {
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getEmployeeDetailedStats,
  selectPackage
} = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateEmployeeValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Percentage must be between 0 and 100')
];

// Routes
router.get('/', authenticateToken, requireAdmin, getEmployees);
router.get('/:id', authenticateToken, requireAdmin, getEmployee);
router.get('/:id/stats', authenticateToken, getEmployeeStats);
router.get('/:id/detailed-stats', authenticateToken, getEmployeeDetailedStats);
router.put('/:id', authenticateToken, requireAdmin, updateEmployeeValidation, updateEmployee);
router.put('/:id/select-package', authenticateToken, selectPackage);
router.delete('/:id', authenticateToken, requireAdmin, deleteEmployee);

module.exports = router;
