const { DataTypes } = require('sequelize');
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
});

module.exports = Customer;
