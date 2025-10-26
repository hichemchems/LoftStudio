const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at'
});

// Instance methods
Expense.prototype.getFullInfo = function() {
  return {
    id: this.id,
    category: this.category,
    amount: parseFloat(this.amount),
    date: this.date,
    description: this.description,
    created_by: this.created_by,
    created_at: this.created_at
  };
};

// Class methods
Expense.getExpensesByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [{ model: sequelize.models.User, as: 'creator' }],
    order: [['date', 'DESC']]
  });
};

Expense.getTotalExpensesByDateRange = function(startDate, endDate) {
  return this.sum('amount', {
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
  });
};

Expense.getExpensesByCategory = function(category, startDate = null, endDate = null) {
  const whereClause = { category };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.findAll({
    where: whereClause,
    include: [{ model: sequelize.models.User, as: 'creator' }],
    order: [['date', 'DESC']]
  });
};

Expense.getTotalByCategory = function(category, startDate = null, endDate = null) {
  const whereClause = { category };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.sum('amount', { where: whereClause });
};

Expense.getMonthlyTotal = function(year, month) {
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

module.exports = Expense;
