
const { DataTypes } = require('sequelize');
<<<<<<< HEAD
const sequelize = require('../dbConfig'); // 直接引入实例

const Build = sequelize.define('Build', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  BuildID: { type: DataTypes.STRING, allowNull: false },
  BuildName: { type: DataTypes.STRING, allowNull: false },
  Garden_ID: { type: DataTypes.INTEGER, allowNull: false },
  Note: { type: DataTypes.STRING }
}, {
  tableName: 'Build',
  timestamps: false
=======
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
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
});

module.exports = Build;
