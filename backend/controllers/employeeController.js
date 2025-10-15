const { validationResult } = require('express-validator');
const { Employee, User, Sale, Package } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all employees for admin dashboard
// @route   GET /api/v1/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { is_active: true },
        attributes: ['id', 'username', 'email', 'role']
      }],
      order: [['name', 'ASC']]
    });

    // Get today's stats for each employee
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        // Get today's sales
        const todaySales = await Sale.findAll({
          where: {
            employee_id: employee.id,
            created_at: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          },
          include: [{
            model: Package,
            as: 'package'
          }]
        });

        // Calculate today's totals
        let todayPackageCount = 0;
        let todayTotalPrice = 0;

        todaySales.forEach(sale => {
          todayPackageCount += 1;
          // Price is TTC (including 20% TVA), so calculate HT price for commission
          const htPrice = sale.package.price / 1.2; // Remove 20% TVA
          todayTotalPrice += htPrice;
        });

        // Calculate commission (percentage of HT price)
        const todayCommission = (todayTotalPrice * employee.percentage) / 100;

        return {
          id: employee.id,
          name: employee.name,
          percentage: employee.percentage,
          user: employee.user,
          todayStats: {
            packageCount: todayPackageCount,
            totalPrice: todayTotalPrice,
            commission: todayCommission
          }
        };
      })
    );

    res.json({
      success: true,
      data: employeesWithStats
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private/Admin
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'role']
      }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, percentage } = req.body;

    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.update({
      name: name || employee.name,
      percentage: percentage !== undefined ? percentage : employee.percentage
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Soft delete by deactivating user
    await employee.user.update({ is_active: false });

    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
};
