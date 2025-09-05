const { DataTypes } = require('sequelize');
<<<<<<< HEAD
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
=======
const { sequelize } = require('../config/database'); // PostgreSQL连接

const Garden = sequelize.define('Garden', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  address: { 
    type: DataTypes.TEXT 
  },
  description: { 
    type: DataTypes.TEXT 
  }
}, {
  tableName: 'gardens',
  timestamps: true,
  underscored: true
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
});

module.exports = Garden;
