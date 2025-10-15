const { Op, fn, col, literal } = require('sequelize');
const { Sale, Receipt, Expense, Salary, AdminCharge, Employee, Package, User } = require('../models');

// @desc    Get dashboard overview data
// @route   GET /api/v1/dashboard/overview
// @access  Private/Admin
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Get current month data
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const [totalSales, totalReceipts, totalExpenses, totalSalaries, adminCharges] = await Promise.all([
      Sale.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        }
      }),
      Receipt.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        }
      }),
      Expense.sum('amount', {
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        }
      }),
      Salary.sum('total_salary', {
        where: {
          period_start: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        }
      }),
      AdminCharge.getChargesByMonthYear(currentMonth, currentYear)
    ]);

    const turnover = (parseFloat(totalSales || 0) + parseFloat(totalReceipts || 0));
    const totalCharges = adminCharges ? adminCharges.getTotalCharges() : 0;
    const profit = turnover - parseFloat(totalExpenses || 0) - parseFloat(totalSalaries || 0) - totalCharges;

    // Get employee count
    const employeeCount = await Employee.count();

    // Get recent sales (last 5)
    const recentSales = await Sale.findAll({
      limit: 5,
      include: [
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] },
        { model: Package, as: 'package' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        turnover: turnover,
        profit: profit,
        totalExpenses: parseFloat(totalExpenses || 0),
        totalSalaries: parseFloat(totalSalaries || 0),
        adminCharges: totalCharges,
        employeeCount: employeeCount,
        recentSales: recentSales.map(sale => ({
          id: sale.id,
          amount: parseFloat(sale.amount),
          client_name: sale.client_name,
          date: sale.date,
          employee: sale.employee?.user?.username,
          package: sale.package?.name
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/v1/dashboard/sales-analytics
// @access  Private/Admin
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    let groupBy, dateFormat;
    if (period === 'month') {
      groupBy = [fn('MONTH', col('date')), fn('YEAR', col('date'))];
      dateFormat = 'YYYY-MM';
    } else if (period === 'week') {
      groupBy = [fn('WEEK', col('date')), fn('YEAR', col('date'))];
      dateFormat = 'YYYY-WW';
    } else {
      groupBy = [fn('DATE', col('date'))];
      dateFormat = 'YYYY-MM-DD';
    }

    const salesData = await Sale.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('date'), dateFormat), 'period'],
        [fn('SUM', col('amount')), 'total_amount'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1)
        }
      },
      group: groupBy,
      order: [[fn('DATE_FORMAT', col('date'), dateFormat), 'ASC']]
    });

    // Get sales by employee
    const salesByEmployee = await Sale.findAll({
      attributes: [
        'employee_id',
        [fn('SUM', col('amount')), 'total_amount'],
        [fn('COUNT', col('id')), 'count']
      ],
      include: [
        { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
      ],
      where: {
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1)
        }
      },
      group: ['employee_id'],
      order: [[fn('SUM', col('amount')), 'DESC']]
    });

    res.json({
      success: true,
      data: {
        salesByPeriod: salesData.map(item => ({
          period: item.dataValues.period,
          total_amount: parseFloat(item.dataValues.total_amount),
          count: parseInt(item.dataValues.count)
        })),
        salesByEmployee: salesByEmployee.map(item => ({
          employee_id: item.employee_id,
          employee_name: item.employee?.user?.username,
          total_amount: parseFloat(item.dataValues.total_amount),
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get profit/loss analytics
// @route   GET /api/v1/dashboard/profit-analytics
// @access  Private/Admin
const getProfitAnalytics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      const [sales, receipts, expenses, salaries, adminCharges] = await Promise.all([
        Sale.sum('amount', {
          where: {
            date: {
              [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
            }
          }
        }),
        Receipt.sum('amount', {
          where: {
            date: {
              [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
            }
          }
        }),
        Expense.sum('amount', {
          where: {
            date: {
              [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
            }
          }
        }),
        Salary.sum('total_salary', {
          where: {
            period_start: {
              [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
            }
          }
        }),
        AdminCharge.getChargesByMonthYear(month, year)
      ]);

      const turnover = (parseFloat(sales || 0) + parseFloat(receipts || 0));
      const totalCharges = adminCharges ? adminCharges.getTotalCharges() : 0;
      const profit = turnover - parseFloat(expenses || 0) - parseFloat(salaries || 0) - totalCharges;

      monthlyData.push({
        month: month,
        year: year,
        turnover: turnover,
        expenses: parseFloat(expenses || 0),
        salaries: parseFloat(salaries || 0),
        admin_charges: totalCharges,
        profit: profit
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Profit analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get employee performance analytics
// @route   GET /api/v1/dashboard/employee-performance
// @access  Private/Admin
const getEmployeePerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const employeeStats = await Employee.findAll({
      include: [
        { model: User, as: 'user' },
        {
          model: Sale,
          as: 'sales',
          where: whereClause,
          required: false
        },
        {
          model: Receipt,
          as: 'receipts',
          where: whereClause,
          required: false
        }
      ],
      attributes: [
        'id',
        [fn('SUM', col('sales.amount')), 'total_sales'],
        [fn('COUNT', col('sales.id')), 'sales_count'],
        [fn('SUM', col('receipts.amount')), 'total_receipts'],
        [fn('COUNT', col('receipts.id')), 'receipts_count']
      ],
      group: ['Employee.id', 'user.id'],
      order: [[fn('SUM', col('sales.amount')), 'DESC']]
    });

    const performanceData = employeeStats.map(stat => ({
      employee_id: stat.id,
      employee_name: stat.user?.username,
      total_sales: parseFloat(stat.dataValues.total_sales || 0),
      sales_count: parseInt(stat.dataValues.sales_count || 0),
      total_receipts: parseFloat(stat.dataValues.total_receipts || 0),
      receipts_count: parseInt(stat.dataValues.receipts_count || 0),
      total_turnover: parseFloat(stat.dataValues.total_sales || 0) + parseFloat(stat.dataValues.total_receipts || 0)
    }));

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Employee performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get monthly report
// @route   GET /api/v1/dashboard/monthly-report/:year/:month
// @access  Private/Admin
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const [sales, receipts, expenses, salaries, adminCharges, salesByEmployee, expensesByCategory] = await Promise.all([
      Sale.findAll({
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        include: [
          { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] },
          { model: Package, as: 'package' }
        ]
      }),
      Receipt.findAll({
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        include: [
          { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
        ]
      }),
      Expense.findAll({
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        include: [
          { model: User, as: 'creator' }
        ]
      }),
      Salary.findAll({
        where: {
          period_start: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        include: [
          { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
        ]
      }),
      AdminCharge.getChargesByMonthYear(parseInt(month), parseInt(year)),
      Sale.findAll({
        attributes: [
          'employee_id',
          [fn('SUM', col('amount')), 'total_amount'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        include: [
          { model: Employee, as: 'employee', include: [{ model: User, as: 'user' }] }
        ],
        group: ['employee_id']
      }),
      Expense.findAll({
        attributes: [
          'category',
          [fn('SUM', col('amount')), 'total_amount'],
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          date: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        group: ['category']
      })
    ]);

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    const totalReceipts = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalSalaries = salaries.reduce((sum, salary) => sum + parseFloat(salary.total_salary), 0);
    const totalCharges = adminCharges ? adminCharges.getTotalCharges() : 0;

    const turnover = totalSales + totalReceipts;
    const profit = turnover - totalExpenses - totalSalaries - totalCharges;

    res.json({
      success: true,
      data: {
        period: { year: parseInt(year), month: parseInt(month) },
        summary: {
          turnover: turnover,
          total_sales: totalSales,
          total_receipts: totalReceipts,
          total_expenses: totalExpenses,
          total_salaries: totalSalaries,
          admin_charges: totalCharges,
          profit: profit
        },
        details: {
          sales: sales.map(s => ({
            id: s.id,
            amount: parseFloat(s.amount),
            client_name: s.client_name,
            date: s.date,
            employee: s.employee?.user?.username,
            package: s.package?.name
          })),
          receipts: receipts.map(r => ({
            id: r.id,
            amount: parseFloat(r.amount),
            client_name: r.client_name,
            date: r.date,
            employee: r.employee?.user?.username
          })),
          expenses: expenses.map(e => ({
            id: e.id,
            category: e.category,
            amount: parseFloat(e.amount),
            date: e.date,
            description: e.description,
            created_by: e.creator?.username
          })),
          salaries: salaries.map(s => ({
            id: s.id,
            employee: s.employee?.user?.username,
            base_salary: parseFloat(s.base_salary),
            commission_percentage: parseFloat(s.commission_percentage),
            total_salary: parseFloat(s.total_salary),
            period_start: s.period_start,
            period_end: s.period_end
          }))
        },
        analytics: {
          salesByEmployee: salesByEmployee.map(s => ({
            employee: s.employee?.user?.username,
            total_amount: parseFloat(s.dataValues.total_amount),
            count: parseInt(s.dataValues.count)
          })),
          expensesByCategory: expensesByCategory.map(e => ({
            category: e.category,
            total_amount: parseFloat(e.dataValues.total_amount),
            count: parseInt(e.dataValues.count)
          }))
        }
      }
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getSalesAnalytics,
  getProfitAnalytics,
  getEmployeePerformance,
  getMonthlyReport
};
