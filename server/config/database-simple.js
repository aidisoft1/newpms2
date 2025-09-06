// 简化的数据库配置 - 只连接本地PostgreSQL
require('dotenv').config();
const { Sequelize } = require('sequelize');

// 直接使用环境变量创建连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sample',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'Aidisoft',
  {
    host: process.env.DB_HOST || '192.168.1.10',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection
};
