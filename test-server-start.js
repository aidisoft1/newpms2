// 简单的服务器启动测试
console.log('🚀 启动服务器测试...');

try {
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log('  DB_HOST:', process.env.DB_HOST || '192.168.1.10');
  console.log('  DB_PORT:', process.env.DB_PORT || 5432);
  console.log('  DB_NAME:', process.env.DB_NAME || 'sample');
  console.log('  DB_USER:', process.env.DB_USER || 'postgres');
  console.log('  PORT:', process.env.PORT || 3000);
  
  // 加载dotenv
  require('dotenv').config();
  console.log('\n✅ .env 文件加载完成');
  
  // 测试数据库配置
  const { sequelize, testConnection } = require('./server/config/database');
  console.log('✅ 数据库配置加载完成');
  
  // 测试express
  const express = require('express');
  const app = express();
  console.log('✅ Express 加载完成');
  
  // 测试路由
  const GardenRouter = require('./server/routes/Garden');
  console.log('✅ Garden 路由加载完成');
  
  console.log('\n🎉 所有模块加载成功，准备启动服务器...');
  
  // 启动简单的HTTP服务器
  app.get('/test', (req, res) => {
    res.json({ message: '服务器运行正常', timestamp: new Date().toISOString() });
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌐 测试服务器启动成功: http://192.168.1.10:${PORT}`);
    console.log(`🔗 测试链接: http://192.168.1.10:${PORT}/test`);
  });
  
} catch (error) {
  console.error('❌ 启动测试失败:', error.message);
  console.error('📍 错误堆栈:', error.stack);
}
