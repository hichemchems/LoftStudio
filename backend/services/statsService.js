const { Employee, Sale, Receipt, EmployeeStats } = require('../models');
const { Op } = require('sequelize');

class StatsService {
  /**
   * Initialize stats for a new employee
   */
  static async initializeStatsForEmployee(employeeId) {
    try {
      const { stats, created } = await EmployeeStats.initializeForEmployee(employeeId);
      if (created) {
        console.log(`Initialized stats for employee ${employeeId}`);
      }
      return stats;
    } catch (error) {
      console.error('Error initializing stats for employee:', error);
      throw error;
    }
  }

  /**
   * Calculate today's stats from sales and receipts
   */
  static async calculateTodayStats(employeeId) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Get today's sales (without include to avoid association issues)
      const sales = await Sale.findAll({
        where: {
          employee_id: employeeId,
          date: {
            [Op.gte]: todayStr,
            [Op.lt]: tomorrowStr
          }
        }
      });

      // Get today's receipts
      const receipts = await Receipt.findAll({
        where: {
          employee_id: employeeId,
          date: {
            [Op.gte]: todayStr,
            [Op.lt]: tomorrowStr
          }
        }
      });

      // Get employee percentage
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Calculate stats
      let totalPackages = 0;
      let totalRevenue = 0;
      const clientSet = new Set();

      sales.forEach(sale => {
        totalPackages += 1;
        // Use HT price (remove 20% TVA) for commission calculation
        const htPrice = parseFloat(sale.amount) / 1.2;
        totalRevenue += htPrice;
        clientSet.add(sale.client_name);
      });

      receipts.forEach(receipt => {
        totalRevenue += parseFloat(receipt.amount);
        clientSet.add(receipt.client_name);
      });

      const totalClients = clientSet.size;
      const commission = (totalRevenue * employee.percentage) / 100;

      return {
        totalPackages,
        totalClients,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        commission: parseFloat(commission.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating today stats:', error);
      throw error;
    }
  }

  /**
   * Update daily stats: add today's stats to weekly and reset daily to 0
   */
  static async updateDailyStats() {
    try {
      console.log('Starting daily stats update...');

      // Get all employees
      const employees = await Employee.findAll();

      for (const employee of employees) {
        try {
          // Initialize stats if they don't exist
          let stats = await EmployeeStats.findOne({
            where: { employee_id: employee.id }
          });

          if (!stats) {
            stats = await this.initializeStatsForEmployee(employee.id);
          }

          // Get today's calculated stats
          const todayStats = await this.calculateTodayStats(employee.id);

          // Add today's stats to weekly stats
          stats.addToWeeklyStats(todayStats);

          // Reset daily stats to 0
          stats.resetDailyStats();

          // Save changes
          await stats.save();

          console.log(`Updated daily stats for employee ${employee.id}: added ${todayStats.totalRevenue}€ to weekly, reset daily to 0`);
        } catch (error) {
          console.error(`Error updating daily stats for employee ${employee.id}:`, error);
        }
      }

      console.log('Daily stats update completed');
    } catch (error) {
      console.error('Error in daily stats update:', error);
      throw error;
    }
  }

  /**
   * Update weekly stats: add weekly stats to monthly and reset weekly to 0
   */
  static async updateWeeklyStats() {
    try {
      console.log('Starting weekly stats update...');

      // Get all employees
      const employees = await Employee.findAll();

      for (const employee of employees) {
        try {
          // Get employee stats
          let stats = await EmployeeStats.findOne({
            where: { employee_id: employee.id }
          });

          if (!stats) {
            stats = await this.initializeStatsForEmployee(employee.id);
          }

          // Get current weekly stats before reset
          const weeklyStats = {
            totalPackages: stats.weekly_total_packages,
            totalClients: stats.weekly_total_clients,
            totalRevenue: parseFloat(stats.weekly_total_revenue),
            commission: parseFloat(stats.weekly_commission)
          };

          // Add weekly stats to monthly stats
          stats.addToMonthlyStats(weeklyStats);

          // Reset weekly stats to 0
          stats.resetWeeklyStats();

          // Save changes
          await stats.save();

          console.log(`Updated weekly stats for employee ${employee.id}: added ${weeklyStats.totalRevenue}€ to monthly, reset weekly to 0`);
        } catch (error) {
          console.error(`Error updating weekly stats for employee ${employee.id}:`, error);
        }
      }

      console.log('Weekly stats update completed');
    } catch (error) {
      console.error('Error in weekly stats update:', error);
      throw error;
    }
  }

  /**
   * Get stats for an employee and period
   */
  static async getEmployeeStats(employeeId, period) {
    try {
      return await EmployeeStats.getStatsForEmployee(employeeId, period);
    } catch (error) {
      console.error('Error getting employee stats:', error);
      throw error;
    }
  }

  /**
   * Manually add a sale/receipt to current daily stats
   */
  static async addToDailyStats(employeeId, statsToAdd) {
    try {
      let employeeStats = await EmployeeStats.findOne({
        where: { employee_id: employeeId }
      });

      if (!employeeStats) {
        employeeStats = await this.initializeStatsForEmployee(employeeId);
      }

      // Add to daily stats
      employeeStats.daily_total_packages += statsToAdd.totalPackages || 0;
      employeeStats.daily_total_clients += statsToAdd.totalClients || 0;
      employeeStats.daily_total_revenue = parseFloat((parseFloat(employeeStats.daily_total_revenue || 0) + (statsToAdd.totalRevenue || 0)).toFixed(2));
      employeeStats.daily_commission = parseFloat((parseFloat(employeeStats.daily_commission || 0) + (statsToAdd.commission || 0)).toFixed(2));

      await employeeStats.save();

      console.log(`Added to daily stats for employee ${employeeId}: ${JSON.stringify(statsToAdd)}`);
    } catch (error) {
      console.error('Error adding to daily stats:', error);
      throw error;
    }
  }
}

module.exports = StatsService;
