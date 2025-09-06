// 最简化的PostgreSQL连接测试
console.log('🔍 PostgreSQL快速连接测试\n');

async function quickTest() {
  try {
    // 尝试加载pg模块
    const { Client } = require('pg');
    console.log('✅ pg模块加载成功');
    
    // 连接配置
    const client = new Client({
      host: '192.168.1.10',
      port: 5432,
      database: 'sample',
      user: 'postgres',
      password: 'Aidisoft',
      connectionTimeoutMillis: 5000, // 5秒超时
    });
    
    console.log('🔄 尝试连接到PostgreSQL...');
    
    await client.connect();
    console.log('✅ 连接成功！');
    
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('📊 当前时间:', result.rows[0].current_time);
    console.log('📋 PostgreSQL版本:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    await client.end();
    console.log('🎉 测试完成！PostgreSQL连接正常\n');
    
    // 运行数据库迁移
    console.log('🔄 是否要初始化数据表？');
    console.log('请运行: npm run migrate');
    
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    console.log('错误代码:', error.code || 'unknown');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL服务未启动，请选择以下方法之一：');
      console.log('');
      console.log('方法1 - Docker运行 (推荐):');
      console.log('docker run --name postgres -e POSTGRES_PASSWORD=Aidisoft -e POSTGRES_DB=sample -p 5432:5432 -d postgres:15');
      console.log('');
      console.log('方法2 - 启动Windows服务:');
      console.log('net start postgresql-x64-15');
      console.log('');
      console.log('方法3 - 全新安装:');
      console.log('https://www.postgresql.org/download/windows/');
      
    } else if (error.code === '28P01') {
      console.log('\n💡 密码认证失败，请检查：');
      console.log('- 用户名: postgres');
      console.log('- 密码: Aidisoft');
      
    } else if (error.code === '3D000') {
      console.log('\n💡 数据库不存在，请先创建：');
      console.log('psql -U postgres -c "CREATE DATABASE sample;"');
      
    } else {
      console.log('\n💡 请参考: POSTGRESQL_SETUP.md');
    }
    
    console.log('\n📞 需要帮助请告诉我具体的错误信息！');
  }
}

quickTest();
