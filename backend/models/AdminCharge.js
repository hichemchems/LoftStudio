const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminCharge = sequelize.define('AdminCharge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  operating_costs: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  electricity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  salaries: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2050
    }
  }
}, {
  tableName: 'admin_charges',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['month', 'year']
    }
  ]
});

// Instance methods
AdminCharge.prototype.getFullInfo = function() {
  return {
    id: this.id,
    rent: parseFloat(this.rent),
    charges: parseFloat(this.charges),
    operating_costs: parseFloat(this.operating_costs),
    electricity: parseFloat(this.electricity),
    salaries: parseFloat(this.salaries),
    total_charges: this.getTotalCharges(),
    month: this.month,
    year: this.year,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

AdminCharge.prototype.getTotalCharges = function() {
  return parseFloat(this.rent) +
         parseFloat(this.charges) +
         parseFloat(this.operating_costs) +
         parseFloat(this.electricity) +
         parseFloat(this.salaries);
};

AdminCharge.prototype.updateCharges = function(chargesData) {
  Object.keys(chargesData).forEach(key => {
    if (this.hasOwnProperty(key) && key !== 'id' && key !== 'month' && key !== 'year') {
      this[key] = chargesData[key];
    }
  });
  return this.save();
};

// Class methods
AdminCharge.getChargesByMonthYear = function(month, year) {
  return this.findOne({
    where: { month, year }
  });
};

AdminCharge.getOrCreateCharges = async function(month, year) {
  let charges = await this.findOne({
    where: { month, year }
  });

  if (!charges) {
    charges = await this.create({
      month,
      year,
      rent: 0,
      charges: 0,
      operating_costs: 0,
      electricity: 0,
      salaries: 0
    });
  }

  return charges;
};

AdminCharge.getChargesHistory = function(limit = 12) {
  return this.findAll({
    order: [['year', 'DESC'], ['month', 'DESC']],
    limit
  });
};

AdminCharge.getTotalChargesByMonthYear = function(month, year) {
  return this.sum('rent', { where: { month, year } })
    .then(rent => this.sum('charges', { where: { month, year } })
    .then(charges => this.sum('operating_costs', { where: { month, year } })
    .then(operating => this.sum('electricity', { where: { month, year } })
    .then(electricity => this.sum('salaries', { where: { month, year } })
    .then(salaries => ({
      rent: parseFloat(rent || 0),
      charges: parseFloat(charges || 0),
      operating_costs: parseFloat(operating || 0),
      electricity: parseFloat(electricity || 0),
      salaries: parseFloat(salaries || 0),
      total: parseFloat(rent || 0) + parseFloat(charges || 0) + parseFloat(operating || 0) + parseFloat(electricity || 0) + parseFloat(salaries || 0)
    }))))));
};

module.exports = AdminCharge;
