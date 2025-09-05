const { sequelize } = require('./server/config/database');

async function checkTable() {
  try {
    console.log('=== 正在连接数据库 ===');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    console.log('\n=== 检查 gardens 表结构 ===');
    const result = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'gardens' 
      ORDER BY ordinal_position;
    `);
    console.log('gardens 表字段:', result[0]);
    
    console.log('\n=== 检查表中的数据 ===');
    const data = await sequelize.query('SELECT * FROM gardens LIMIT 5;');
    console.log('gardens 表数据:', data[0]);
    
    await sequelize.close();
  } catch (err) {
    console.error('❌ 错误:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('💡 PostgreSQL 服务可能没有启动，请检查服务状态');
    }
    process.exit(1);
  }
}

checkTable();
