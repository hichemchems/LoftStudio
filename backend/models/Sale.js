const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
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
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'packages',
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
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at'
});

// Instance methods
Sale.prototype.getFullInfo = function() {
  return {
    id: this.id,
    employee_id: this.employee_id,
    package_id: this.package_id,
    client_name: this.client_name,
    amount: parseFloat(this.amount),
    date: this.date,
    description: this.description,
    created_at: this.created_at
  };
};

// Class methods
Sale.getSalesByEmployee = function(employeeId, startDate = null, endDate = null) {
  const whereClause = { employee_id: employeeId };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.findAll({
    where: whereClause,
    include: [
      { model: sequelize.models.Package, as: 'package' },
      { model: sequelize.models.Employee, as: 'employee' }
    ],
    order: [['date', 'DESC'], ['created_at', 'DESC']]
  });
};

Sale.getTotalSalesByEmployee = function(employeeId, startDate = null, endDate = null) {
  const whereClause = { employee_id: employeeId };
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }

  return this.sum('amount', { where: whereClause });
};

Sale.getSalesByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      { model: sequelize.models.Package, as: 'package' },
      { model: sequelize.models.Employee, as: 'employee', include: [{ model: sequelize.models.User, as: 'user' }] }
    ],
    order: [['date', 'DESC']]
  });
};

module.exports = Sale;
