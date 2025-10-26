const express = require('express');
const { body } = require('express-validator');
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  activatePackage
} = require('../controllers/packageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createPackageValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Package name must be between 2 and 100 characters')
    .notEmpty()
    .withMessage('Package name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .notEmpty()
    .withMessage('Price is required'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

const updatePackageValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Package name must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Routes
router.get('/', authenticateToken, getPackages);
router.get('/:id', authenticateToken, getPackage);
router.post('/', authenticateToken, requireAdmin, createPackageValidation, createPackage);
router.put('/:id', authenticateToken, requireAdmin, updatePackageValidation, updatePackage);
router.delete('/:id', authenticateToken, requireAdmin, deletePackage);
router.put('/:id/activate', authenticateToken, requireAdmin, activatePackage);

module.exports = router;
