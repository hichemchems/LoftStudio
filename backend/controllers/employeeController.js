const { validationResult } = require('express-validator');
const { Employee, User, Sale, Package, Receipt, EmployeeStats } = require('../models');
const { Op } = require('sequelize');
const StatsService = require('../services/statsService');

// @desc    Get all employees for admin dashboard
// @route   GET /api/v1/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: {
            is_active: true,
            created_by: req.user.id // Only show employees created by this admin
          },
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: Package,
          as: 'selectedPackage',
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['name', 'ASC']]
    });

    // Get current month's stats for each employee (including today)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        // Get month's sales - include all sales for the employee (not filtered by selected package)
        const monthSalesWhere = {
          employee_id: employee.id,
          date: {
            [Op.gte]: monthStart.toISOString().split('T')[0],
            [Op.lt]: monthEnd.toISOString().split('T')[0]
          }
        };

        const monthSales = await Sale.findAll({
          where: monthSalesWhere,
          include: [{
            model: Package,
            as: 'package'
          }]
        });

        // Get month's receipts (including today)
        const monthReceipts = await Receipt.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: monthStart.toISOString().split('T')[0],
              [Op.lt]: monthEnd.toISOString().split('T')[0]
            }
          }
        });

        // Calculate month's totals
        let monthPackageCount = 0;
        let monthTotalPrice = 0;
        let monthReceiptsTotal = 0;
        const clientSet = new Set();

        monthSales.forEach(sale => {
          monthPackageCount += 1;
          // Price is TTC (including 20% TVA), so calculate HT price for commission
          const htPrice = sale.package.price / 1.2; // Remove 20% TVA
          monthTotalPrice += htPrice;
          clientSet.add(sale.client_name); // Track unique clients
        });

        monthReceipts.forEach(receipt => {
          monthReceiptsTotal += parseFloat(receipt.amount);
          clientSet.add(receipt.client_name); // Track unique clients
        });

        const monthTotalClients = clientSet.size;
        const monthTotalRevenue = monthTotalPrice + monthReceiptsTotal;

        // Calculate commission (percentage of HT price from sales + receipts)
        const monthCommission = (monthTotalRevenue * employee.percentage) / 100;

        return {
          id: employee.id,
          name: employee.name,
          percentage: employee.percentage,
          user: employee.user,
          selectedPackage: employee.selectedPackage ? {
            id: employee.selectedPackage.id,
            name: employee.selectedPackage.name,
            price: parseFloat(employee.selectedPackage.price)
          } : null,
          monthStats: {
            packageCount: monthPackageCount,
            totalClients: monthTotalClients,
            totalRevenue: monthTotalRevenue,
            commission: monthCommission
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
    // Allow access if user is admin or if the employee record belongs to the current user
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If user is employee, they can only access their own stats
    if (req.user.role === 'employee' && employee.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(tomorrow);
        break;
      case 'week':
        // Week including today: from start of week to end of today
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endDate = new Date(tomorrow); // Include today
        break;
      case 'month':
        // Month including today: from start of month to end of today
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(tomorrow); // Include today
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(tomorrow);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Get sales for the period - include all sales for the employee
    const salesWhere = {
      employee_id: id,
      date: {
        [Op.gte]: startStr,
        [Op.lt]: endStr
      }
    };

    const sales = await Sale.findAll({
      where: salesWhere,
      include: [{
        model: Package,
        as: 'package'
      }]
    });

    // Get receipts for the period
    const receipts = await Receipt.findAll({
      where: {
        employee_id: id,
        date: {
          [Op.gte]: startStr,
          [Op.lt]: endStr
        }
      }
    });

    // Get cumulative stats from the employee_stats table
    const cumulativeStats = await StatsService.getEmployeeStats(id, period);

    // For backward compatibility, also calculate real-time stats from sales/receipts
    // This ensures accuracy and allows comparison
    let totalPackages = 0;
    let totalClients = 0;
    let totalRevenue = 0;
    let totalReceipts = 0;
    const clientSet = new Set();

    sales.forEach(sale => {
      totalPackages += 1;
      // Use HT price (remove 20% TVA) for commission calculation
      const htPrice = parseFloat(sale.amount) / 1.2;
      totalRevenue += htPrice;
      clientSet.add(sale.client_name);
    });

    receipts.forEach(receipt => {
      totalReceipts += parseFloat(receipt.amount);
      clientSet.add(receipt.client_name);
    });

    totalClients = clientSet.size;
    const totalRevenueWithReceipts = totalRevenue + totalReceipts;
    const commission = (totalRevenueWithReceipts * employee.percentage) / 100;

    const realTimeStats = {
      totalPackages,
      totalClients,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      commission: parseFloat(commission.toFixed(2))
    };

    res.json({
      success: true,
      data: {
        period,
        // Use cumulative stats as primary data
        totalPackages: cumulativeStats.totalPackages,
        totalClients: cumulativeStats.totalClients,
        totalRevenue: cumulativeStats.totalRevenue,
        commission: cumulativeStats.commission,
        percentage: employee.percentage,
        // Include real-time stats for verification/debugging
        realTimeStats,
        // Flag if there's a discrepancy
        statsMatch: (
          cumulativeStats.totalPackages === realTimeStats.totalPackages &&
          cumulativeStats.totalClients === realTimeStats.totalClients &&
          Math.abs(cumulativeStats.totalRevenue - realTimeStats.totalRevenue) < 0.01 &&
          Math.abs(cumulativeStats.commission - realTimeStats.commission) < 0.01
        ),
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

// @desc    Get detailed employee statistics by time period
// @route   GET /api/v1/employees/detailed-stats/:id
// @access  Private/Employee
const getEmployeeDetailedStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'today' } = req.query; // today, week, month, year

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
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If user is employee, they can only access their own stats
    if (req.user.role === 'employee' && employee.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(tomorrow);
        break;
      case 'week':
        // Week including today: from start of week to end of today
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endDate = new Date(tomorrow); // Include today
        break;
      case 'month':
        // Month including today: from start of month to end of today
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(tomorrow); // Include today
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        endDate = new Date(tomorrow); // Include today
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(tomorrow);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Get sales for the period - include all sales for the employee
    const salesWhere = {
      employee_id: id,
      date: {
        [Op.gte]: startStr,
        [Op.lt]: endStr
      }
    };

    const sales = await Sale.findAll({
      where: salesWhere,
      include: [{
        model: Package,
        as: 'package'
      }],
      order: [['date', 'DESC']]
    });

    // Get receipts for the period
    const receipts = await Receipt.findAll({
      where: {
        employee_id: id,
        date: {
          [Op.gte]: startStr,
          [Op.lt]: endStr
        }
      },
      order: [['date', 'DESC']]
    });

    // Calculate statistics and format packages
    let totalPackages = 0;
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalReceiptsAmount = 0;
    const clientSet = new Set();

    const packages = sales.map(sale => {
      totalPackages += 1;
      // Use HT price (remove 20% TVA) for commission calculation
      const htPrice = parseFloat(sale.amount) / 1.2;
      const commission = (htPrice * employee.percentage) / 100;

      totalRevenue += htPrice;
      totalCommission += commission;
      clientSet.add(sale.client_name);

      return {
        id: sale.id,
        client_name: sale.client_name,
        package_name: sale.package?.name || 'Unknown Package',
        ht_price: parseFloat(htPrice.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        date: sale.date
      };
    });

    // Add receipts to the packages list and calculations
    const receiptsFormatted = receipts.map(receipt => {
      const commission = (parseFloat(receipt.amount) * employee.percentage) / 100;
      totalReceiptsAmount += parseFloat(receipt.amount);
      totalCommission += commission;
      clientSet.add(receipt.client_name);

      return {
        id: `receipt-${receipt.id}`,
        client_name: receipt.client_name,
        package_name: 'Recette',
        ht_price: parseFloat(receipt.amount.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        date: receipt.date
      };
    });

    const totalClients = clientSet.size;
    const allPackages = [...packages, ...receiptsFormatted];

    res.json({
      success: true,
      data: {
        period,
        totalPackages,
        totalClients,
        totalRevenue: parseFloat((totalRevenue + totalReceiptsAmount).toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        packages: allPackages
      }
    });
  } catch (error) {
    console.error('Get employee detailed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Select package for employee
// @route   PUT /api/v1/employees/:id/select-package
// @access  Private/Employee
const selectPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { packageId } = req.body;

    // Verify employee exists and belongs to current user or user is admin
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

    // Check permissions: admin can select for any employee, employee can only select for themselves
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && employee.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If packageId is provided, verify package exists and is active
    if (packageId) {
      const pkg = await Package.findByPk(packageId);
      if (!pkg || !pkg.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive package'
        });
      }
    }

    // Update employee's selected package
    await employee.update({
      selected_package_id: packageId || null
    });

    // If a package is selected, create a sale record to count towards turnover
    if (packageId) {
      const pkg = await Package.findByPk(packageId);
      if (pkg) {
        // Use local date to avoid timezone issues
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        const sale = await Sale.create({
          employee_id: employee.id,
          package_id: packageId,
          amount: pkg.price, // TTC price
          date: dateStr,
          client_name: 'Sélection de forfait'
        });

        // Add this sale to today's cumulative stats
        const htPrice = pkg.price / 1.2; // Remove 20% TVA
        const commission = (htPrice * employee.percentage) / 100;

        await StatsService.addToDailyStats(employee.id, {
          totalPackages: 1,
          totalClients: 1, // Assuming new client for package selection
          totalRevenue: htPrice,
          commission: commission
        });
      }
    }

    // Emit real-time update to dashboard
    const io = require('../socket').getIo();
    if (io) {
      io.emit('dashboard-data-updated');
    }

    res.json({
      success: true,
      message: packageId ? 'Package selected successfully' : 'Package deselected successfully',
      data: {
        employeeId: employee.id,
        selectedPackageId: packageId
      }
    });
  } catch (error) {
    console.error('Select package error:', error);
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
  getEmployeeStats,
  getEmployeeDetailedStats,
  selectPackage
};
