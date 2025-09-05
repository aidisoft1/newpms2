
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // PostgreSQL连接

const Build = sequelize.define('Building', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  gardenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'garden_id'
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  address: { 
    type: DataTypes.TEXT 
  },
  totalFloors: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_floors'
  },
  totalRooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_rooms'
  }
}, {
  tableName: 'buildings',
  timestamps: true,
  underscored: true
});

module.exports = Build;
