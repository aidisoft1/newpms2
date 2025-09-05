
const { DataTypes } = require('sequelize');
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
});

module.exports = Build;
