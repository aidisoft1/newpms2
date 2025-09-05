const { DataTypes } = require('sequelize');
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
});

module.exports = Room;
