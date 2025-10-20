const { Employee, Sale, Receipt, EmployeeStats } = require('../models');
const { Op } = require('sequelize');
const StatsService = require('../services/statsService');

async function initializeEmployeeStats() {
  try {
    console.log('Starting employee stats initialization...');

    // Get all employees
    const employees = await Employee.findAll();
    console.log(`Found ${employees.length} employees to initialize`);

    for (const employee of employees) {
      try {
        console.log(`Initializing stats for employee ${employee.id} (${employee.name})`);

        // Initialize stats record
        const { stats, created } = await EmployeeStats.initializeForEmployee(employee.id);
        if (created) {
          console.log(`Created new stats record for employee ${employee.id}`);
        }

        // Calculate and populate historical data
        // For today - initialize with 0 since we can't calculate without associations
        stats.daily_total_packages = 0;
        stats.daily_total_clients = 0;
        stats.daily_total_revenue = 0.00;
        stats.daily_commission = 0.00;

        // For this week (from Sunday to today)
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0];

        const weekSales = await Sale.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: weekStartStr,
              [Op.lt]: tomorrowStr
            }
          }
        });

        const weekReceipts = await Receipt.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: weekStartStr,
              [Op.lt]: tomorrowStr
            }
          }
        });

        // Calculate weekly stats
        let weekPackages = 0;
        let weekRevenue = 0;
        let weekReceiptsTotal = 0;
        const weekClientSet = new Set();

        weekSales.forEach(sale => {
          weekPackages += 1;
          const htPrice = parseFloat(sale.amount) / 1.2;
          weekRevenue += htPrice;
          weekClientSet.add(sale.client_name);
        });

        weekReceipts.forEach(receipt => {
          weekReceiptsTotal += parseFloat(receipt.amount);
          weekClientSet.add(receipt.client_name);
        });

        const weekTotalRevenue = weekRevenue + weekReceiptsTotal;
        const weekCommission = (weekTotalRevenue * employee.percentage) / 100;

        stats.weekly_total_packages = weekPackages;
        stats.weekly_total_clients = weekClientSet.size;
        stats.weekly_total_revenue = parseFloat(weekTotalRevenue.toFixed(2));
        stats.weekly_commission = parseFloat(weekCommission.toFixed(2));

        // For this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const monthSales = await Sale.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: monthStartStr,
              [Op.lt]: tomorrowStr
            }
          }
        });

        const monthReceipts = await Receipt.findAll({
          where: {
            employee_id: employee.id,
            date: {
              [Op.gte]: monthStartStr,
              [Op.lt]: tomorrowStr
            }
          }
        });

        // Calculate monthly stats
        let monthPackages = 0;
        let monthRevenue = 0;
        let monthReceiptsTotal = 0;
        const monthClientSet = new Set();

        monthSales.forEach(sale => {
          monthPackages += 1;
          const htPrice = parseFloat(sale.amount) / 1.2;
          monthRevenue += htPrice;
          monthClientSet.add(sale.client_name);
        });

        monthReceipts.forEach(receipt => {
          monthReceiptsTotal += parseFloat(receipt.amount);
          monthClientSet.add(receipt.client_name);
        });

        const monthTotalRevenue = monthRevenue + monthReceiptsTotal;
        const monthCommission = (monthTotalRevenue * employee.percentage) / 100;

        stats.monthly_total_packages = monthPackages;
        stats.monthly_total_clients = monthClientSet.size;
        stats.monthly_total_revenue = parseFloat(monthTotalRevenue.toFixed(2));
        stats.monthly_commission = parseFloat(monthCommission.toFixed(2));

        // Save the stats
        await stats.save();

        console.log(`Initialized stats for employee ${employee.id}:`);
        console.log(`  Daily: ${stats.daily_total_packages} packages, ${stats.daily_total_revenue}€ revenue`);
        console.log(`  Weekly: ${stats.weekly_total_packages} packages, ${stats.weekly_total_revenue}€ revenue`);
        console.log(`  Monthly: ${stats.monthly_total_packages} packages, ${stats.monthly_total_revenue}€ revenue`);

      } catch (error) {
        console.error(`Error initializing stats for employee ${employee.id}:`, error);
      }
    }

    console.log('Employee stats initialization completed successfully');
  } catch (error) {
    console.error('Error in employee stats initialization:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const { sequelize } = require('../models');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected');
      return initializeEmployeeStats();
    })
    .then(() => {
      console.log('Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeEmployeeStats };
