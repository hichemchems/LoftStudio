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

// @desc    Get employee statistics by time period
// @route   GET /api/v1/employees/stats/:id
// @access  Private/Employee
const getEmployeeStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'today' } = req.query; // today, week, month

    // Verify employee belongs to current user or user is admin
    const employee = await Employee.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if user is admin or the employee themselves
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && employee.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Get sales for the period
    const sales = await Sale.findAll({
      where: {
        employee_id: id,
        date: { [Op.between]: [startStr, endStr] }
      },
      include: [{
        model: Package,
        as: 'package'
      }]
    });

    // Calculate statistics
    let totalPackages = 0;
    let totalClients = 0;
    let totalRevenue = 0;
    const clientSet = new Set();

    sales.forEach(sale => {
      totalPackages += 1;
      totalRevenue += parseFloat(sale.amount);
      clientSet.add(sale.client_name);
    });

    totalClients = clientSet.size;
    const commission = (totalRevenue * employee.percentage) / 100;

    res.json({
      success: true,
      data: {
        period,
        totalPackages,
        totalClients,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        percentage: employee.percentage,
        sales: sales.map(sale => ({
          id: sale.id,
          date: sale.date,
          amount: parseFloat(sale.amount),
          client_name: sale.client_name,
          package_name: sale.package?.name
        }))
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
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
  deleteEmployee,
  getEmployeeStats
};
