const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Employee = require('./Employee');
const Package = require('./Package');
const Sale = require('./Sale');
const Receipt = require('./Receipt');
const Expense = require('./Expense');
const Salary = require('./Salary');
const AdminCharge = require('./AdminCharge');

// Define associations
const defineAssociations = () => {
  // User - Employee relationship
  User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
  Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Employee - Sales relationship
  Employee.hasMany(Sale, { foreignKey: 'employee_id', as: 'sales' });
  Sale.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  // Employee - Receipts relationship
  Employee.hasMany(Receipt, { foreignKey: 'employee_id', as: 'receipts' });
  Receipt.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  // Employee - Salaries relationship
  Employee.hasMany(Salary, { foreignKey: 'employee_id', as: 'salaries' });
  Salary.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  // Package - Sales relationship
  Package.hasMany(Sale, { foreignKey: 'package_id', as: 'sales' });
  Sale.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

  // Employee - Package relationship (selected package)
  Employee.belongsTo(Package, { foreignKey: 'selected_package_id', as: 'selectedPackage' });
  Package.hasMany(Employee, { foreignKey: 'selected_package_id', as: 'employees' });

  // User - Expenses relationship (created_by)
  User.hasMany(Expense, { foreignKey: 'created_by', as: 'expenses' });
  Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
};

module.exports = {
  sequelize,
  User,
  Employee,
  Package,
  Sale,
  Receipt,
  Expense,
  Salary,
  AdminCharge,
  defineAssociations
};
