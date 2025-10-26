const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Salary = sequelize.define('Salary', {
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
  base_salary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  commission_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  total_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'salaries',
  timestamps: true,
  createdAt: 'created_at'
});

// Instance methods
Salary.prototype.getFullInfo = function() {
  return {
    id: this.id,
    employee_id: this.employee_id,
    base_salary: parseFloat(this.base_salary),
    commission_percentage: parseFloat(this.commission_percentage),
    total_salary: parseFloat(this.total_salary),
    period_start: this.period_start,
    period_end: this.period_end,
    created_at: this.created_at
  };
};

// Class methods
Salary.getSalariesByEmployee = function(employeeId, startDate = null, endDate = null) {
  const whereClause = { employee_id: employeeId };
  if (startDate && endDate) {
    whereClause[Op.or] = [
      {
        period_start: {
          [Op.between]: [startDate, endDate]
        }
      },
      {
        period_end: {
          [Op.between]: [startDate, endDate]
        }
      }
    ];
  }

  return this.findAll({
    where: whereClause,
    include: [{ model: sequelize.models.Employee, as: 'employee' }],
    order: [['period_end', 'DESC']]
  });
};

Salary.getSalaryByPeriod = function(employeeId, periodStart, periodEnd) {
  return this.findOne({
    where: {
      employee_id: employeeId,
      period_start: periodStart,
      period_end: periodEnd
    }
  });
};

Salary.calculateMonthlySalary = function(employeeId, periodStart, periodEnd) {
  // This would typically involve complex calculations based on receipts, sales, expenses, etc.
  // For now, return a basic structure
  return {
    employee_id: employeeId,
    period_start: periodStart,
    period_end: periodEnd,
    base_salary: 0,
    commission_percentage: 0,
    total_turnover: 0,
    total_salary: 0
  };
};

Salary.generateMonthlySalaries = async function(periodStart, periodEnd) {
  // Get all employees
  const employees = await sequelize.models.Employee.findAll();

  const salaries = [];

  for (const employee of employees) {
    const salaryData = await this.calculateMonthlySalary(employee.id, periodStart, periodEnd);
    salaries.push(salaryData);
  }

  return salaries;
};

module.exports = Salary;
