const { validationResult } = require('express-validator');
const { Package } = require('../models');
const { io } = require('../server');

// @desc    Get all packages
// @route   GET /api/v1/packages
// @access  Private
const getPackages = async (req, res) => {
  try {
    const { active = 'true' } = req.query;
    const whereClause = {};

    if (active === 'true') {
      whereClause.is_active = true;
    }

    const packages = await Package.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: packages.map(pkg => pkg.getDisplayInfo())
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single package
// @route   GET /api/v1/packages/:id
// @access  Private
const getPackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: package.getDisplayInfo()
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create package
// @route   POST /api/v1/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, price, is_active = true } = req.body;

    // Check if package with same name exists
    const existingPackage = await Package.findOne({ where: { name } });
    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Package with this name already exists'
      });
    }

    const package = await Package.create({
      name,
      price,
      is_active
    });

    // Emit real-time update to dashboard
    io.emit('dashboard-data-updated');

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: package.getDisplayInfo()
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update package
// @route   PUT /api/v1/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, price, is_active } = req.body;
    const package = await Package.findByPk(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== package.name) {
      const existingPackage = await Package.findOne({ where: { name } });
      if (existingPackage) {
        return res.status(400).json({
          success: false,
          message: 'Package with this name already exists'
        });
      }
    }

    // Update package
    await package.update({
      name: name || package.name,
      price: price !== undefined ? price : package.price,
      is_active: is_active !== undefined ? is_active : package.is_active
    });

    // Emit real-time update to dashboard
    io.emit('dashboard-data-updated');

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: package.getDisplayInfo()
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete/Deactivate package
// @route   DELETE /api/v1/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Soft delete by deactivating
    await package.deactivate();

    // Emit real-time update to dashboard
    io.emit('dashboard-data-updated');

    res.json({
      success: true,
      message: 'Package deactivated successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Activate package
// @route   PUT /api/v1/packages/:id/activate
// @access  Private/Admin
const activatePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await package.activate();

    // Emit real-time update to dashboard
    io.emit('dashboard-data-updated');

    res.json({
      success: true,
      message: 'Package activated successfully',
      data: package.getDisplayInfo()
    });
  } catch (error) {
    console.error('Activate package error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  activatePackage
};
