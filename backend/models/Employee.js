const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contract_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  employment_declaration_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  certification_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Employee.prototype.getFullInfo = function() {
  return {
    id: this.id,
    user_id: this.user_id,
    name: this.name,
    position: this.position,
    hire_date: this.hire_date,
    percentage: this.percentage,
    photo: this.photo,
    avatar_url: this.avatar_url,
    contract_url: this.contract_url,
    employment_declaration_url: this.employment_declaration_url,
    certification_url: this.certification_url,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

Employee.prototype.calculateSalary = function(baseSalary, totalTurnover) {
  const commission = (totalTurnover * this.percentage) / 100;
  return baseSalary + commission;
};

module.exports = Employee;
