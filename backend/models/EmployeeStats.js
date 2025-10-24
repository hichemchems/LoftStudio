const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmployeeStats = sequelize.define('EmployeeStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  // Daily stats (reset to 0 every day at 00:00:00)
  daily_total_packages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  daily_total_clients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  daily_total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  daily_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  // Weekly stats (reset to 0 every Sunday at 00:00:00)
  weekly_total_packages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  weekly_total_clients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  weekly_total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  weekly_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  // Monthly stats (cumulative, never reset automatically)
  monthly_total_packages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  monthly_total_clients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  monthly_total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  monthly_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'employee_stats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Instance methods
EmployeeStats.prototype.getStats = function(period) {
  switch (period) {
    case 'today':
      return {
        totalPackages: this.daily_total_packages || 0,
        totalClients: this.daily_total_clients || 0,
        totalRevenue: parseFloat(this.daily_total_revenue || 0),
        commission: parseFloat(this.daily_commission || 0)
      };
    case 'week':
      return {
        totalPackages: this.weekly_total_packages || 0,
        totalClients: this.weekly_total_clients || 0,
        totalRevenue: parseFloat(this.weekly_total_revenue || 0),
        commission: parseFloat(this.weekly_commission || 0)
      };
    case 'month':
      return {
        totalPackages: this.monthly_total_packages || 0,
        totalClients: this.monthly_total_clients || 0,
        totalRevenue: parseFloat(this.monthly_total_revenue || 0),
        commission: parseFloat(this.monthly_commission || 0)
      };
    default:
      throw new Error(`Invalid period: ${period}. Must be 'today', 'week', or 'month'.`);
  }
};

EmployeeStats.prototype.resetDailyStats = function() {
  this.daily_total_packages = 0;
  this.daily_total_clients = 0;
  this.daily_total_revenue = 0.00;
  this.daily_commission = 0.00;
  this.last_updated = new Date();
};

EmployeeStats.prototype.resetWeeklyStats = function() {
  this.weekly_total_packages = 0;
  this.weekly_total_clients = 0;
  this.weekly_total_revenue = 0.00;
  this.weekly_commission = 0.00;
  this.last_updated = new Date();
};

EmployeeStats.prototype.addToWeeklyStats = function(dailyStats) {
  this.weekly_total_packages += dailyStats.totalPackages;
  this.weekly_total_clients += dailyStats.totalClients;
  this.weekly_total_revenue = parseFloat((parseFloat(this.weekly_total_revenue) + dailyStats.totalRevenue).toFixed(2));
  this.weekly_commission = parseFloat((parseFloat(this.weekly_commission) + dailyStats.commission).toFixed(2));
  this.last_updated = new Date();
};

EmployeeStats.prototype.addToMonthlyStats = function(weeklyStats) {
  this.monthly_total_packages += weeklyStats.totalPackages;
  this.monthly_total_clients += weeklyStats.totalClients;
  this.monthly_total_revenue = parseFloat((parseFloat(this.monthly_total_revenue) + weeklyStats.totalRevenue).toFixed(2));
  this.monthly_commission = parseFloat((parseFloat(this.monthly_commission) + weeklyStats.commission).toFixed(2));
  this.last_updated = new Date();
};

// Class methods
EmployeeStats.initializeForEmployee = async function(employeeId) {
  try {
    const [stats, created] = await this.findOrCreate({
      where: { employee_id: employeeId },
      defaults: {
        employee_id: employeeId,
        daily_total_packages: 0,
        daily_total_clients: 0,
        daily_total_revenue: 0.00,
        daily_commission: 0.00,
        weekly_total_packages: 0,
        weekly_total_clients: 0,
        weekly_total_revenue: 0.00,
        weekly_commission: 0.00,
        monthly_total_packages: 0,
        monthly_total_clients: 0,
        monthly_total_revenue: 0.00,
        monthly_commission: 0.00
      }
    });
    return { stats, created };
  } catch (error) {
    console.error('Error initializing stats for employee:', error);
    throw error;
  }
};

EmployeeStats.getStatsForEmployee = async function(employeeId, period) {
  try {
    const stats = await this.findOne({
      where: { employee_id: employeeId }
    });

    if (!stats) {
      // Initialize stats if they don't exist
      const { stats: newStats } = await this.initializeForEmployee(employeeId);
      return newStats.getStats(period);
    }

    return stats.getStats(period);
  } catch (error) {
    console.error('Error getting stats for employee:', error);
    throw error;
  }
};

module.exports = EmployeeStats;
