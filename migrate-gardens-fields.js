// 数据库迁移脚本 - 为gardens表添加新字段
require('dotenv').config();
const { sequelize } = require('./server/config/database-simple');

async function migrateGardensTable() {
  console.log('🚀 开始迁移gardens表结构...\n');
  
  try {
    // 添加新字段的SQL语句
    const migrations = [
      // 管理区编号
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS area_id VARCHAR(50);`,
      
      // 楼宇数量字段
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS low_building_count INTEGER DEFAULT 0;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS high_building_count INTEGER DEFAULT 0;`,
      
      // 面积字段
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS build_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS land_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS public_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS green_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS road_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS parking_area DECIMAL(12,2) DEFAULT 0.00;`,
      `ALTER TABLE gardens ADD COLUMN IF NOT EXISTS garage_area DECIMAL(12,2) DEFAULT 0.00;`,
      
      // 添加注释
      `COMMENT ON COLUMN gardens.area_id IS '管理区编号';`,
      `COMMENT ON COLUMN gardens.low_building_count IS '多层楼宇数量';`,
      `COMMENT ON COLUMN gardens.high_building_count IS '高层楼宇数量';`,
      `COMMENT ON COLUMN gardens.build_area IS '建筑面积(平方米)';`,
      `COMMENT ON COLUMN gardens.land_area IS '占地面积(平方米)';`,
      `COMMENT ON COLUMN gardens.public_area IS '公共场所面积(平方米)';`,
      `COMMENT ON COLUMN gardens.green_area IS '绿化面积(平方米)';`,
      `COMMENT ON COLUMN gardens.road_area IS '道路面积(平方米)';`,
      `COMMENT ON COLUMN gardens.parking_area IS '车位面积(平方米)';`,
      `COMMENT ON COLUMN gardens.garage_area IS '车库面积(平方米)';`
    ];
    
    // 执行迁移
    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      console.log(`📝 执行迁移 ${i + 1}/${migrations.length}: ${sql.substring(0, 60)}...`);
      
      try {
        await sequelize.query(sql);
        console.log(`✅ 迁移 ${i + 1} 成功`);
      } catch (error) {
        // 如果字段已存在，继续执行
        if (error.message.includes('already exists') || error.message.includes('已存在')) {
          console.log(`⚠️  迁移 ${i + 1} 跳过 (字段已存在)`);
        } else {
          console.error(`❌ 迁移 ${i + 1} 失败:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 数据库迁移完成！');
    
    // 验证表结构
    console.log('\n📋 验证表结构...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'gardens' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 当前gardens表结构:');
    results.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  }
}

// 执行迁移
migrateGardensTable()
  .then(() => {
    console.log('\n✨ 迁移脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 迁移脚本执行失败:', error);
    process.exit(1);
  });
