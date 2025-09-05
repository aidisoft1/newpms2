const { DataTypes } = require('sequelize');
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
});

module.exports = Garden;
