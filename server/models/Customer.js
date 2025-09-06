const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const  sequelize  = require('../dbConfig');

const Customer = sequelize.define('Customer', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CustomerID: { type: DataTypes.STRING, allowNull: false },
  CustomerName: { type: DataTypes.STRING, allowNull: false },
  Birthday: { type: DataTypes.DATEONLY },
  Mobile: { type: DataTypes.STRING },
  Note: { type: DataTypes.STRING }
}, {
  tableName: 'Customer',
  timestamps: false
=======
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
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
});

module.exports = Customer;
