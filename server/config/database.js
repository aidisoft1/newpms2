// PostgreSQL数据库配置
const { Sequelize } = require('sequelize');

// 数据库连接配置
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'newpms2_dev',
    host: process.env.DB_HOST || '192.168.1.10',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // 开发环境显示SQL日志
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // 生产环境关闭SQL日志
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// 根据环境选择配置
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// 创建Sequelize实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
    define: {
      timestamps: true, // 自动添加createdAt和updatedAt字段
      underscored: true, // 使用下划线命名约定
      freezeTableName: true // 防止Sequelize自动复数化表名
    }
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  config
};
