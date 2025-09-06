const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database-simple'); // PostgreSQL连接

const Garden = sequelize.define('Garden', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  // 基本信息
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    comment: '管理区名称'
  },
  area_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '管理区编号'
  },
  address: { 
    type: DataTypes.TEXT,
    comment: '管理区地址'
  },
  description: { 
    type: DataTypes.TEXT,
    comment: '备注描述'
  },
  
  // 楼宇数量字段
  low_building_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '多层楼宇数量'
  },
  high_building_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '高层楼宇数量'
  },
  
  // 面积字段 (使用DECIMAL类型存储精确数值)
  build_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '建筑面积(平方米)'
  },
  land_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '占地面积(平方米)'
  },
  public_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '公共场所面积(平方米)'
  },
  green_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '绿化面积(平方米)'
  },
  road_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '道路面积(平方米)'
  },
  parking_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '车位面积(平方米)'
  },
  garage_area: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '车库面积(平方米)'
  }
}, {
  tableName: 'gardens',
  timestamps: true,
  underscored: true,
  comment: '管理区表'
});

module.exports = Garden;
