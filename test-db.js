// 测试PostgreSQL数据库连接
require('dotenv').config();
const { sequelize, testConnection } = require('./server/config/database');

async function main() {
  console.log('🔄 开始测试PostgreSQL数据库连接...');
  console.log(`📍 连接地址: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`📂 数据库名: ${process.env.DB_NAME}`);
  console.log(`👤 用户名: ${process.env.DB_USER}`);
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('🎉 数据库连接测试通过！');
    
    // 显示数据库信息
    try {
      const [results] = await sequelize.query('SELECT version()');
      console.log('📊 PostgreSQL版本:', results[0].version);
    } catch (error) {
      console.log('⚠️  无法获取数据库版本信息');
    }
    
    process.exit(0);
  } else {
    console.log('❌ 数据库连接测试失败！');
    console.log('💡 请检查以下配置:');
    console.log('   1. PostgreSQL服务是否启动');
    console.log('   2. .env文件中的数据库配置是否正确');
    console.log('   3. 数据库用户权限是否足够');
    process.exit(1);
  }
}

main();
