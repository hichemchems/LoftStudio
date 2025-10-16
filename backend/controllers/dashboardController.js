const { Op } = require('sequelize');
const { Sale, Receipt, Expense, Salary, Employee, Package, User } = require('../models');
const { getIo } = require('../socket');

// @desc    Get dashboard analytics
// @route   GET /api/v1/dashboard/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Calculate turnover (sales + receipts)
    const totalSales = await Sale.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    const totalReceipts = await Receipt.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    const turnover = totalSales + totalReceipts;

    // Calculate total expenses
    const totalExpenses = await Expense.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    // Calculate profit
    const profit = turnover - totalExpenses;

    // Get employee count
    const employeeCount = await Employee.count();

    // Get package count
    const packageCount = await Package.count({ where: { is_active: true } });

    // Get recent sales
    const recentSales = await Sale.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: Package, as: 'package' },
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
      ]
    });

    // Get recent receipts
    const recentReceipts = await Receipt.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }]
    });

    // Get recent expenses
    const recentExpenses = await Expense.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'creator' }]
    });

    // Monthly data for charts (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthEndStr = monthEnd.toISOString().split('T')[0];

      const monthSales = await Sale.sum('amount', {
        where: { date: { [Op.between]: [monthStartStr, monthEndStr] } }
      }) || 0;

      const monthReceipts = await Receipt.sum('amount', {
        where: { date: { [Op.between]: [monthStartStr, monthEndStr] } }
      }) || 0;

      const monthExpenses = await Expense.sum('amount', {
        where: { date: { [Op.between]: [monthStartStr, monthEndStr] } }
      }) || 0;

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sales: monthSales,
        receipts: monthReceipts,
        expenses: monthExpenses,
        profit: (monthSales + monthReceipts) - monthExpenses
      });
    }

    const analytics = {
      summary: {
        turnover: parseFloat(turnover.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        employeeCount,
        packageCount
      },
      recentActivity: {
        sales: recentSales.map(sale => ({
          id: sale.id,
          amount: parseFloat(sale.amount),
          date: sale.date,
          client_name: sale.client_name,
          package_name: sale.package?.name,
          employee_name: sale.employee?.user?.name
        })),
        receipts: recentReceipts.map(receipt => ({
          id: receipt.id,
          amount: parseFloat(receipt.amount),
          date: receipt.date,
          client_name: receipt.client_name,
          employee_name: receipt.employee?.user?.name
        })),
        expenses: recentExpenses.map(expense => ({
          id: expense.id,
          amount: parseFloat(expense.amount),
          date: expense.date,
          category: expense.category,
          description: expense.description,
          created_by: expense.creator?.name
        }))
      },
      monthlyData
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get dashboard alerts
// @route   GET /api/v1/dashboard/alerts
// @access  Private/Admin
const getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Check for low stock packages (if we had stock tracking)
    // For now, we'll check for inactive packages that might need attention

    const inactivePackages = await Package.count({ where: { is_active: false } });
    if (inactivePackages > 0) {
      alerts.push({
        type: 'warning',
        message: `${inactivePackages} package(s) are currently inactive`,
        action: 'Review and activate if needed'
      });
    }

    // Check for employees without recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeEmployees = await Employee.findAll();
    for (const employee of activeEmployees) {
      const recentSales = await Sale.count({
        where: {
          employee_id: employee.id,
          date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
        }
      });

      const recentReceipts = await Receipt.count({
        where: {
          employee_id: employee.id,
          date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
        }
      });

      if (recentSales === 0 && recentReceipts === 0) {
        alerts.push({
          type: 'info',
          message: `${employee.user?.name} has no recent activity (30+ days)`,
          action: 'Check employee status'
        });
      }
    }

    // Check for high expenses this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const monthlyExpenses = await Expense.sum('amount', {
      where: { date: { [Op.gte]: monthStartStr } }
    }) || 0;

    if (monthlyExpenses > 5000) { // Threshold for high expenses
      alerts.push({
        type: 'warning',
        message: `High monthly expenses: $${monthlyExpenses.toFixed(2)}`,
        action: 'Review expense categories'
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales report
// @route   GET /api/v1/dashboard/reports/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const whereClause = {
      date: { [Op.between]: [startStr, endStr] }
    };

    if (employeeId) {
      whereClause.employee_id = employeeId;
    }

    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: Package, as: 'package' },
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
      ],
      order: [['date', 'DESC']]
    });

    const totalAmount = await Sale.sum('amount', { where: whereClause }) || 0;

    const report = {
      period: { start: startStr, end: endStr },
      totalSales: parseFloat(totalAmount.toFixed(2)),
      salesCount: sales.length,
      sales: sales.map(sale => ({
        id: sale.id,
        date: sale.date,
        amount: parseFloat(sale.amount),
        client_name: sale.client_name,
        package_name: sale.package?.name,
        employee_name: sale.employee?.user?.name
      }))
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get profit/loss report
// @route   GET /api/v1/dashboard/reports/profit-loss
// @access  Private/Admin
const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const sales = await Sale.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    const receipts = await Receipt.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    const expenses = await Expense.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    const salaries = await Salary.sum('total_salary', {
      where: {
        period_start: { [Op.gte]: startStr },
        period_end: { [Op.lte]: endStr }
      }
    }) || 0;

    const revenue = sales + receipts;
    const totalExpenses = expenses + salaries;
    const profit = revenue - totalExpenses;

    const report = {
      period: { start: startStr, end: endStr },
      revenue: parseFloat(revenue.toFixed(2)),
      expenses: parseFloat(totalExpenses.toFixed(2)),
      salaries: parseFloat(salaries.toFixed(2)),
      otherExpenses: parseFloat(expenses.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      profitMargin: revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(2)) : 0
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get profit loss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to emit real-time updates
const emitDashboardUpdate = (userId, data) => {
  const io = getIo();
  if (io) {
    io.to(`dashboard-${userId}`).emit('dashboard-update', data);
  }
};

module.exports = {
  getAnalytics,
  getAlerts,
  getSalesReport,
  getProfitLossReport,
  emitDashboardUpdate
};
