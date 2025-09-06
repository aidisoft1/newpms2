// 简单的PostgreSQL连接测试
require('dotenv').config();
const { Client } = require('pg');

// 从环境变量或使用默认值
const config = {
  host: process.env.DB_HOST || '192.168.1.10',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres', // 先连接默认数据库
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aidisoft'
};

async function testSimpleConnection() {
  console.log('🔄 测试PostgreSQL连接...');
  console.log('📍 连接配置:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: '***'
  });

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ PostgreSQL连接成功！');
    
    // 查询版本信息
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL版本:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    // 查询现有数据库
    const dbResult = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log('📂 现有数据库:', dbResult.rows.map(row => row.datname).join(', '));
    
    await client.end();
    return true;
    
  } catch (error) {
    console.error('❌ PostgreSQL连接失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 建议检查：');
      console.log('   1. PostgreSQL服务是否启动？');
      console.log('   2. 端口5432是否开放？');
      console.log('   3. 可以尝试安装PostgreSQL：');
      console.log('      - Windows: https://www.postgresql.org/download/windows/');
      console.log('      - Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres');
    } else if (error.code === '28P01') {
      console.log('💡 密码认证失败，请检查用户名和密码');
    }
    
    await client.end().catch(() => {});
    return false;
  }
}

if (require.main === module) {
  testSimpleConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testSimpleConnection;
