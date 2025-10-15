const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Package.prototype.getDisplayInfo = function() {
  return {
    id: this.id,
    name: this.name,
    price: parseFloat(this.price),
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

Package.prototype.deactivate = function() {
  this.is_active = false;
  return this.save();
};

Package.prototype.activate = function() {
  this.is_active = true;
  return this.save();
};

Package.prototype.updatePrice = function(newPrice) {
  this.price = newPrice;
  return this.save();
};

// Class methods
Package.getActivePackages = function() {
  return this.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']]
  });
};

Package.findByName = function(name) {
  return this.findOne({
    where: { name: name, is_active: true }
  });
};

module.exports = Package;
