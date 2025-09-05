const { DataTypes } = require('sequelize');
const sequelize = require('../dbConfig'); // 假设 db.js 导出了 sequelize 实例

const Garden = sequelize.define('Garden', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Number: { type: DataTypes.STRING, allowNull: false },
  GardenID: { type: DataTypes.STRING, allowNull: false },
  Name: { type: DataTypes.STRING, allowNull: false },
  Area: { type: DataTypes.FLOAT, allowNull: false },
  Note: { type: DataTypes.STRING }
}, {
  tableName: 'Garden',
  timestamps: false
});

module.exports = Garden;
