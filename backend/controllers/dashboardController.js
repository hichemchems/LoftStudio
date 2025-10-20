const { Op, Sequelize } = require('sequelize');
const { Sale, Receipt, Expense, Salary, Employee, Package, User, sequelize } = require('../models');
const { getIo } = require('../socket');

// @desc    Get dashboard analytics
// @route   GET /api/v1/dashboard/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided (to match employee monthly stats)
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Get employees created by this admin
    const adminEmployees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { created_by: req.user.id },
        required: true
      }]
    });

    const adminEmployeeIds = adminEmployees.map(emp => emp.id);

    // Calculate turnover (sales + receipts) only for admin's employees
    const totalSales = await Sale.sum('amount', {
      where: {
        employee_id: { [Op.in]: adminEmployeeIds },
        date: { [Op.between]: [startStr, endStr] }
      }
    }) || 0;

    const totalReceipts = await Receipt.sum('amount', {
      where: {
        employee_id: { [Op.in]: adminEmployeeIds },
        date: { [Op.between]: [startStr, endStr] }
      }
    }) || 0;

    const turnover = totalSales + totalReceipts;

    // Calculate total expenses (all expenses, not filtered by admin)
    const totalExpenses = await Expense.sum('amount', {
      where: { date: { [Op.between]: [startStr, endStr] } }
    }) || 0;

    // Calculate total commissions for admin's employees only
    let totalCommissions = 0;

    for (const employee of adminEmployees) {
      // Get sales for this employee in the period - filter by selected package if one is selected
      const employeeSalesWhere = {
        employee_id: employee.id,
        date: { [Op.between]: [startStr, endStr] }
      };

      if (employee.selected_package_id) {
        employeeSalesWhere.package_id = employee.selected_package_id;
      }

      const employeeSales = await Sale.findAll({
        where: employeeSalesWhere,
        include: [{ model: Package, as: 'package' }]
      });

      let employeeRevenueHT = 0;
      employeeSales.forEach(sale => {
        const htPrice = sale.package.price / 1.2; // Convert TTC to HT
        employeeRevenueHT += htPrice;
      });

      // Add receipts for this employee
      const employeeReceipts = await Receipt.sum('amount', {
        where: {
          employee_id: employee.id,
          date: { [Op.between]: [startStr, endStr] }
        }
      }) || 0;

      const totalEmployeeRevenue = employeeRevenueHT + employeeReceipts;
      const commission = (totalEmployeeRevenue * employee.percentage) / 100;
      totalCommissions += commission;
    }

    // Calculate TVA (20% of turnover) - this is collected from customers but paid to tax authorities
    const tvaAmount = turnover * 0.20;

    // Calculate profit: turnover - expenses - commissions (TVA is not an expense)
    const profit = turnover - totalExpenses - totalCommissions;

    // Get employee count (employees created by admin)
    const employeeCount = adminEmployees.length;

    // Get package count (packages executed/selected by admin's barbers)
    // Count distinct packages that have been selected by admin's employees
    const executedPackages = await Sale.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('package_id')), 'package_id']
      ],
      where: {
        employee_id: { [Op.in]: adminEmployeeIds },
        date: { [Op.between]: [startStr, endStr] }
      },
      raw: true
    });
    const packageCount = executedPackages.length;

    // Get employees created by this admin with their selected packages and month stats
    const employees = adminEmployees;

    // Add selected package info to employees
    const employeesWithPackages = await Promise.all(
      employees.map(async (employee) => {
        // Get selected package info
        const employeeWithPackage = await Employee.findByPk(employee.id, {
          include: [
            {
              model: Package,
              as: 'selectedPackage',
              attributes: ['id', 'name', 'price']
            }
          ]
        });
        // Get current month's sales and receipts for stats (consistent with employee dashboard)
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Get month's sales - filter by selected package if one is selected
        const monthSalesWhere = {
          employee_id: employee.id,
          date: {
            [Op.gte]: monthStart.toISOString().split('T')[0],
            [Op.lt]: monthEnd.toISOString().split('T')[0]
          }
        };

        if (employee.selected_package_id) {
          monthSalesWhere.package_id = employee.selected_package_id;
        }

        const monthSales = await Sale.findAll({
          where: monthSalesWhere,
          include: [{
            model: Package,
            as: 'package'
          }]
        });

        const monthReceipts = await Receipt.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: monthStart.toISOString().split('T')[0],
              [Op.lt]: monthEnd.toISOString().split('T')[0]
            }
          }
        });

        let monthPackageCount = 0;
        let monthTotalPrice = 0;
        let monthReceiptsTotal = 0;
        const clientSet = new Set();

        monthSales.forEach(sale => {
          monthPackageCount += 1;
          const htPrice = sale.package.price / 1.2;
          monthTotalPrice += htPrice;
          clientSet.add(sale.client_name); // Track unique clients
        });

        monthReceipts.forEach(receipt => {
          monthReceiptsTotal += parseFloat(receipt.amount);
          clientSet.add(receipt.client_name); // Track unique clients
        });

        const monthTotalClients = clientSet.size;
        const monthTotalRevenue = monthTotalPrice + monthReceiptsTotal;
        const monthCommission = (monthTotalRevenue * employee.percentage) / 100;

        // Return employee data with selected package from DB
        return {
          id: employee.id,
          name: employee.name,
          percentage: employee.percentage,
          user: employee.user,
          selectedPackage: employeeWithPackage.selectedPackage ? {
            id: employeeWithPackage.selectedPackage.id,
            name: employeeWithPackage.selectedPackage.name,
            price: parseFloat(employeeWithPackage.selectedPackage.price)
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

      const monthSales = await Sale.sum('amount', {
        where: { date: { [Op.between]: [monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]] } }
      }) || 0;

      const monthReceipts = await Receipt.sum('amount', {
        where: { date: { [Op.between]: [monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]] } }
      }) || 0;

      const monthExpenses = await Expense.sum('amount', {
        where: { date: { [Op.between]: [monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]] } }
      }) || 0;

      // Calculate monthly commissions and TVA for accurate profit (only for admin's employees)
      let monthCommissions = 0;

      for (const employee of adminEmployees) {
        // Get month's sales for employee - filter by selected package if one is selected
        const monthEmpSalesWhere = {
          employee_id: employee.id,
          date: { [Op.between]: [monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]] }
        };

        if (employee.selected_package_id) {
          monthEmpSalesWhere.package_id = employee.selected_package_id;
        }

        const monthEmpSales = await Sale.findAll({
          where: monthEmpSalesWhere,
          include: [{ model: Package, as: 'package' }]
        });

        let monthEmpRevenueHT = 0;
        monthEmpSales.forEach(sale => {
          const htPrice = sale.package.price / 1.2;
          monthEmpRevenueHT += htPrice;
        });

        const monthEmpReceipts = await Receipt.sum('amount', {
          where: {
            employee_id: employee.id,
            date: { [Op.between]: [monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]] }
          }
        }) || 0;

        const totalMonthEmpRevenue = monthEmpRevenueHT + monthEmpReceipts;
        const commission = (totalMonthEmpRevenue * employee.percentage) / 100;
        monthCommissions += commission;
      }

      const monthTurnover = monthSales + monthReceipts;
      const monthTva = monthTurnover * 0.20;
      const monthProfit = monthTurnover - monthExpenses - monthCommissions;

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sales: monthSales,
        receipts: monthReceipts,
        expenses: monthExpenses,
        commissions: monthCommissions,
        tva: monthTva,
        profit: monthProfit
      });
    }

    const analytics = {
      summary: {
        turnover: parseFloat(turnover.toFixed(2)), // Chiffre d'Affaires
        profit: parseFloat(profit.toFixed(2)), // Bénéfice
        employeeCount, // Employés
        packageCount, // Forfaits Actifs
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

// @desc    Get annual profit report
// @route   GET /api/v1/dashboard/reports/annual-profit
// @access  Private/Admin
const getAnnualProfitReport = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // Get employees created by this admin
    const adminEmployees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { created_by: req.user.id },
        required: true
      }]
    });

    const monthlyProfits = [];

    // Calculate profit for each month of the year
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(selectedYear, month, 1);
      const monthEnd = new Date(selectedYear, month + 1, 0);

      const startStr = monthStart.toISOString().split('T')[0];
      const endStr = monthEnd.toISOString().split('T')[0];

      // Calculate turnover (sales + receipts) only for admin's employees
      const monthSales = await Sale.sum('amount', {
        where: {
          employee_id: { [Op.in]: adminEmployees.map(emp => emp.id) },
          date: { [Op.between]: [startStr, endStr] }
        }
      }) || 0;

      const monthReceipts = await Receipt.sum('amount', {
        where: {
          employee_id: { [Op.in]: adminEmployees.map(emp => emp.id) },
          date: { [Op.between]: [startStr, endStr] }
        }
      }) || 0;

      const monthTurnover = monthSales + monthReceipts;

      // Calculate total expenses for the month
      const monthExpenses = await Expense.sum('amount', {
        where: { date: { [Op.between]: [startStr, endStr] } }
      }) || 0;

      // Calculate monthly commissions for admin's employees
      let monthCommissions = 0;

      for (const employee of adminEmployees) {
        // Get month's sales for employee - filter by selected package if one is selected
        const monthEmpSalesWhere = {
          employee_id: employee.id,
          date: { [Op.between]: [startStr, endStr] }
        };

        if (employee.selected_package_id) {
          monthEmpSalesWhere.package_id = employee.selected_package_id;
        }

        const monthEmpSales = await Sale.findAll({
          where: monthEmpSalesWhere,
          include: [{ model: Package, as: 'package' }]
        });

        let monthEmpRevenueHT = 0;
        monthEmpSales.forEach(sale => {
          const htPrice = sale.package.price / 1.2;
          monthEmpRevenueHT += htPrice;
        });

        const monthEmpReceipts = await Receipt.sum('amount', {
          where: {
            employee_id: employee.id,
            date: { [Op.between]: [startStr, endStr] }
          }
        }) || 0;

        const totalMonthEmpRevenue = monthEmpRevenueHT + monthEmpReceipts;
        const commission = (totalMonthEmpRevenue * employee.percentage) / 100;
        monthCommissions += commission;
      }

      // Calculate monthly profit: turnover - expenses - commissions
      const monthProfit = monthTurnover - monthExpenses - monthCommissions;

      monthlyProfits.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        monthNumber: month + 1,
        turnover: parseFloat(monthTurnover.toFixed(2)),
        expenses: parseFloat(monthExpenses.toFixed(2)),
        commissions: parseFloat(monthCommissions.toFixed(2)),
        profit: parseFloat(monthProfit.toFixed(2))
      });
    }

    // Calculate annual totals
    const annualTotals = {
      totalTurnover: monthlyProfits.reduce((sum, month) => sum + month.turnover, 0),
      totalExpenses: monthlyProfits.reduce((sum, month) => sum + month.expenses, 0),
      totalCommissions: monthlyProfits.reduce((sum, month) => sum + month.commissions, 0),
      totalProfit: monthlyProfits.reduce((sum, month) => sum + month.profit, 0)
    };

    // Format annual totals
    Object.keys(annualTotals).forEach(key => {
      annualTotals[key] = parseFloat(annualTotals[key].toFixed(2));
    });

    const report = {
      year: selectedYear,
      monthlyProfits,
      annualTotals
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get annual profit report error:', error);
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

    // Calculate commissions for the period (only for admin's employees)
    let totalCommissionsReport = 0;

    for (const employee of adminEmployees) {
      // Get sales for employee in report period - filter by selected package if one is selected
      const employeeSalesReportWhere = {
        employee_id: employee.id,
        date: { [Op.between]: [startStr, endStr] }
      };

      if (employee.selected_package_id) {
        employeeSalesReportWhere.package_id = employee.selected_package_id;
      }

      const employeeSalesReport = await Sale.findAll({
        where: employeeSalesReportWhere,
        include: [{ model: Package, as: 'package' }]
      });

      let employeeRevenueHTR = 0;
      employeeSalesReport.forEach(sale => {
        const htPrice = sale.package.price / 1.2;
        employeeRevenueHTR += htPrice;
      });

      const employeeReceiptsReport = await Receipt.sum('amount', {
        where: {
          employee_id: employee.id,
          date: { [Op.between]: [startStr, endStr] }
        }
      }) || 0;

      const totalEmployeeRevenueR = employeeRevenueHTR + employeeReceiptsReport;
      const commissionR = (totalEmployeeRevenueR * employee.percentage) / 100;
      totalCommissionsReport += commissionR;
    }

    const revenue = sales + receipts;
    const tvaReport = revenue * 0.20;
    const totalExpenses = expenses + salaries + totalCommissionsReport;
    const profit = revenue - totalExpenses;

    const report = {
      period: { start: startStr, end: endStr },
      revenue: parseFloat(revenue.toFixed(2)),
      expenses: parseFloat(totalExpenses.toFixed(2)),
      salaries: parseFloat(salaries.toFixed(2)),
      otherExpenses: parseFloat(expenses.toFixed(2)),
      commissions: parseFloat(totalCommissionsReport.toFixed(2)),
      tva: parseFloat(tvaReport.toFixed(2)),
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
  getAnnualProfitReport,
  getProfitLossReport,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  emitDashboardUpdate
};
