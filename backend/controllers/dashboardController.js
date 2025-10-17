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

    // Get employees with their selected packages
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          as: 'user',
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

    const employeesWithPackages = await Promise.all(
      employees.map(async (employee) => {
        // Get today's sales for stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

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

        let todayPackageCount = 0;
        let todayTotalPrice = 0;

        todaySales.forEach(sale => {
          todayPackageCount += 1;
          const htPrice = sale.package.price / 1.2;
          todayTotalPrice += htPrice;
        });

        const todayCommission = (todayTotalPrice * employee.percentage) / 100;

        // Return employee data with selected package from DB
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
          todayStats: {
            packageCount: todayPackageCount,
            totalRevenue: todayTotalPrice,
            commission: todayCommission
          }
        };
      })
    );

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
        packageCount,
        employees: employeesWithPackages
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

// @desc    Get expenses
// @route   GET /api/v1/dashboard/expenses
// @access  Private/Admin
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: User, as: 'creator' }],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        date: expense.date,
        category: expense.category,
        created_by: expense.creator?.name,
        created_at: expense.created_at
      }))
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create expense
// @route   POST /api/v1/dashboard/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;

    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      date,
      category: category || null,
      created_by: req.user.id
    });

    const expenseWithCreator = await Expense.findByPk(expense.id, {
      include: [{ model: User, as: 'creator' }]
    });

    res.status(201).json({
      success: true,
      data: {
        id: expenseWithCreator.id,
        description: expenseWithCreator.description,
        amount: parseFloat(expenseWithCreator.amount),
        date: expenseWithCreator.date,
        category: expenseWithCreator.category,
        created_by: expenseWithCreator.creator?.name,
        created_at: expenseWithCreator.created_at
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/v1/dashboard/expenses/:id
// @access  Private/Admin
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, date, category } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.update({
      description,
      amount: parseFloat(amount),
      date,
      category: category || null
    });

    const updatedExpense = await Expense.findByPk(id, {
      include: [{ model: User, as: 'creator' }]
    });

    res.json({
      success: true,
      data: {
        id: updatedExpense.id,
        description: updatedExpense.description,
        amount: parseFloat(updatedExpense.amount),
        date: updatedExpense.date,
        category: updatedExpense.category,
        created_by: updatedExpense.creator?.name,
        created_at: updatedExpense.created_at
      }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/dashboard/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
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
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  emitDashboardUpdate
};
