// db.js
// 用于连接和导出 SQL Server 数据库实例
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Sample', 'sa', 'W2Sm1i3KnJR8JkK0', {
  host: 'aidisoft2009.gnway.vip',
  port: 2433,
  dialect: 'mssql',
  dialectOptions: {
    encrypt: false,
    trustServerCertificate: true
  }
});

module.exports = sequelize;
