const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Receipt = sequelize.define('Receipt', {
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
  client_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'receipts',
  timestamps: true,
  createdAt: 'created_at'
});

// Instance methods
Receipt.prototype.getFullInfo = function() {
  return {
    id: this.id,
    employee_id: this.employee_id,
    client_name: this.client_name,
    amount: parseFloat(this.amount),
    date: this.date,
    description: this.description,
    created_at: this.created_at
  };
};

// Class methods
Receipt.getReceiptsByEmployee = function(employeeId, startDate = null, endDate = null) {
  const whereClause = { employee_id: employeeId };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.findAll({
    where: whereClause,
    include: [{ model: sequelize.models.Employee, as: 'employee' }],
    order: [['date', 'DESC'], ['created_at', 'DESC']]
  });
};

Receipt.getTotalReceiptsByEmployee = function(employeeId, startDate = null, endDate = null) {
  const whereClause = { employee_id: employeeId };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.sum('amount', { where: whereClause });
};

Receipt.getReceiptsByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [{ model: sequelize.models.Employee, as: 'employee', include: [{ model: sequelize.models.User, as: 'user' }] }],
    order: [['date', 'DESC']]
  });
};

Receipt.getDailyTotal = function(date) {
  return this.sum('amount', {
    where: { date: date }
  });
};

Receipt.getMonthlyTotal = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.sum('amount', {
    where: {
      date: {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      }
    }
  });
};

module.exports = Receipt;
