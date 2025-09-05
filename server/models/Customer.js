const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  customerNumber: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    field: 'customer_number'
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  birthday: { 
    type: DataTypes.DATEONLY 
  },
  mobile: { 
    type: DataTypes.STRING(20) 
  },
  description: { 
    type: DataTypes.TEXT 
  }
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

module.exports = Customer;
