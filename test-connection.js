// 直接测试PostgreSQL连接
console.log('开始PostgreSQL连接测试...');

// 手动设置配置
const config = {
  host: 'localhost',
  port: 5432,
  database: 'sample',
  user: 'postgres',
  password: 'Aidisoft'
};

console.log('配置信息:', config);

try {
  const { Client } = require('pg');
  console.log('✅ pg模块加载成功');
  
  const client = new Client(config);
  
  client.connect()
    .then(() => {
      console.log('✅ PostgreSQL连接成功！');
      return client.query('SELECT version()');
    })
    .then(result => {
      console.log('📊 PostgreSQL版本:', result.rows[0].version);
      return client.end();
    })
    .then(() => {
      console.log('🎉 连接测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 连接失败:', error.message);
      console.error('错误代码:', error.code);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ 模块加载失败:', error.message);
  console.log('💡 请运行: npm install pg');
  process.exit(1);
}
