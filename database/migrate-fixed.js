require('dotenv').config();
const { sequelize } = require('../server/config/database');

// 导入所有模型
const Garden = require('../server/models/Garden');
const Build = require('../server/models/Build');
const Room = require('../server/models/Room');
const Customer = require('../server/models/Customer');

async function migrate() {
  try {
    console.log('🔄 开始数据库迁移...\n');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 强制同步所有表（会重新创建表）
    console.log('🔄 同步表结构...');
    await sequelize.sync({ force: true });
    console.log('✅ 表结构同步完成');
    
    console.log('\n📊 插入示例数据...');
    
    // 1. 创建管理区数据
    const gardens = await Garden.bulkCreate([
      {
        name: '阳光花园小区',
        address: '北京市朝阳区阳光大街123号',
        description: '高档住宅小区，环境优美'
      },
      {
        name: '绿荫苑',
        address: '北京市海淀区绿荫路88号',
        description: '绿化覆盖率高的住宅区'
      },
      {
        name: '静雅园',
        address: '北京市西城区静雅街66号',
        description: '安静舒适的居住环境'
      }
    ]);
    console.log(`✅ 已创建 ${gardens.length} 个管理区`);
    
    // 2. 创建楼栋数据
    const buildings = await Build.bulkCreate([
      {
        gardenId: gardens[0].id,
        name: '1号楼',
        address: '阳光花园小区1号楼',
        totalFloors: 18,
        totalRooms: 72
      },
      {
        gardenId: gardens[0].id,
        name: '2号楼',
        address: '阳光花园小区2号楼',
        totalFloors: 20,
        totalRooms: 80
      },
      {
        gardenId: gardens[1].id,
        name: 'A栋',
        address: '绿荫苑A栋',
        totalFloors: 15,
        totalRooms: 60
      },
      {
        gardenId: gardens[2].id,
        name: '静雅1号',
        address: '静雅园1号',
        totalFloors: 12,
        totalRooms: 48
      }
    ]);
    console.log(`✅ 已创建 ${buildings.length} 个楼栋`);
    
    // 3. 创建房间数据
    const rooms = [];
    for (const building of buildings) {
      for (let floor = 1; floor <= Math.min(building.totalFloors, 3); floor++) {
        for (let room = 1; room <= 4; room++) {
          const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
          rooms.push({
            buildingId: building.id,
            roomNumber: roomNumber,
            name: `房间${roomNumber}`,
            area: 80 + Math.random() * 40, // 80-120平方米
            description: `${building.name}第${floor}层${room}号房`
          });
        }
      }
    }
    
    const createdRooms = await Room.bulkCreate(rooms);
    console.log(`✅ 已创建 ${createdRooms.length} 个房间`);
    
    // 4. 创建客户数据
    const customers = await Customer.bulkCreate([
      {
        customerNumber: 'C001',
        name: '张三',
        birthday: '1980-05-15',
        mobile: '13800138001',
        description: '长期租户，信誉良好'
      },
      {
        customerNumber: 'C002',
        name: '李四',
        birthday: '1985-08-20',
        mobile: '13800138002',
        description: '新客户'
      },
      {
        customerNumber: 'C003',
        name: '王五',
        birthday: '1978-12-10',
        mobile: '13800138003',
        description: '老客户，已续租多次'
      },
      {
        customerNumber: 'C004',
        name: '赵六',
        birthday: '1990-03-25',
        mobile: '13800138004',
        description: '年轻租户'
      }
    ]);
    console.log(`✅ 已创建 ${customers.length} 个客户`);
    
    console.log('\n🎉 数据库迁移完成！');
    console.log('📋 数据统计:');
    console.log(`   - 管理区: ${gardens.length} 个`);
    console.log(`   - 楼栋: ${buildings.length} 个`);
    console.log(`   - 房间: ${createdRooms.length} 个`);
    console.log(`   - 客户: ${customers.length} 个`);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

migrate();
