// 测试 192.168.1.10 数据库连接
require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔄 正在连接到数据库服务器...');
    console.log(`📡 服务器地址: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`🗄️ 数据库名: ${process.env.DB_NAME}`);
    console.log(`👤 用户名: ${process.env.DB_USER}`);
    
    const client = await pool.connect();
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('⏰ 服务器时间:', result.rows[0].current_time);
    console.log('🔧 PostgreSQL 版本:', result.rows[0].version);
    
    // 检查是否存在 gardens 表
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'gardens'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ gardens 表存在');
      
      // 查询表中的数据
      const dataCheck = await client.query('SELECT COUNT(*) as count FROM gardens');
      console.log(`📊 gardens 表中有 ${dataCheck.rows[0].count} 条记录`);
      
      // 显示前几条记录
      const sampleData = await client.query('SELECT * FROM gardens LIMIT 3');
      console.log('📋 示例数据:');
      sampleData.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, 名称: ${row.name}, 地址: ${row.address}`);
      });
    } else {
      console.log('❌ gardens 表不存在，需要运行迁移脚本');
    }
    
    client.release();
    await pool.end();
    console.log('\n🎉 连接测试完成！');
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 连接被拒绝，请检查：');
      console.error('   1. PostgreSQL 服务是否在 192.168.1.10 上运行');
      console.error('   2. 端口 5432 是否开放');
      console.error('   3. 防火墙设置');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 找不到主机，请检查：');
      console.error('   1. IP 地址 192.168.1.10 是否正确');
      console.error('   2. 网络连接是否正常');
    } else if (error.code === '28P01') {
      console.error('💡 身份验证失败，请检查：');
      console.error('   1. 用户名和密码是否正确');
      console.error('   2. pg_hba.conf 配置');
    }
    
    process.exit(1);
  }
}

testConnection();
