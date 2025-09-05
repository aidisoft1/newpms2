// 检查数据库表结构
require('dotenv').config();
const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'sample',
    user: 'postgres',
    password: 'Aidisoft'
  });

  try {
    await client.connect();
    console.log('🔍 查看数据库表结构...\n');
    
    // 查看所有表
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 数据库中的表:');
    tables.rows.forEach(row => console.log('  - ' + row.table_name));
    
    // 查看gardens表结构
    if (tables.rows.some(row => row.table_name === 'gardens')) {
      const gardenCols = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'gardens' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n🌿 gardens表结构:');
      gardenCols.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    // 查看Garden表结构（如果存在）
    if (tables.rows.some(row => row.table_name === 'Garden')) {
      const gardenCols = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'Garden' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n🌿 Garden表结构:');
      gardenCols.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    await client.end();
  }
}

checkTables();
