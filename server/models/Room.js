const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  roomNumber: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    field: 'room_number'
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  buildingId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'building_id'
  },
  area: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  description: { 
    type: DataTypes.TEXT 
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true
});

module.exports = Room;
