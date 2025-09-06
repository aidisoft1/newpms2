const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const sequelize = require('../dbConfig');

const Room = sequelize.define('Room', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  RoomID: { type: DataTypes.STRING, allowNull: false },
  RoomName: { type: DataTypes.STRING, allowNull: false },
  Build_ID: { type: DataTypes.INTEGER, allowNull: false },
  RoomArea: { type: DataTypes.FLOAT, allowNull: true },
  Note: { type: DataTypes.STRING },
}, {
  tableName: 'Room',
  timestamps: false
=======
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
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
});

module.exports = Room;
