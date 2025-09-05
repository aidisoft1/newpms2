// 数据库迁移和同步工具
require('dotenv').config();
const { sequelize } = require('../server/config/database');

// 定义所有模型 (简单版本，后续可以扩展)
const User = sequelize.define('User', {
  username: {
    type: sequelize.Sequelize.STRING(50),
    unique: true,
    allowNull: false
  },
  email: {
    type: sequelize.Sequelize.STRING(100),
    unique: true,
    allowNull: false
  },
  passwordHash: {
    type: sequelize.Sequelize.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: sequelize.Sequelize.STRING(20),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  underscored: true
});

const Garden = sequelize.define('Garden', {
  name: {
    type: sequelize.Sequelize.STRING(100),
    allowNull: false
  },
  address: sequelize.Sequelize.TEXT,
  description: sequelize.Sequelize.TEXT
}, {
  tableName: 'gardens',
  underscored: true
});

const Building = sequelize.define('Building', {
  gardenId: {
    type: sequelize.Sequelize.INTEGER,
    references: {
      model: Garden,
      key: 'id'
    },
    field: 'garden_id'
  },
  name: {
    type: sequelize.Sequelize.STRING(100),
    allowNull: false
  },
  address: sequelize.Sequelize.TEXT,
  totalFloors: {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 0,
    field: 'total_floors'
  },
  totalRooms: {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 0,
    field: 'total_rooms'
  }
}, {
  tableName: 'buildings',
  underscored: true
});

const Room = sequelize.define('Room', {
  buildingId: {
    type: sequelize.Sequelize.INTEGER,
    references: {
      model: Building,
      key: 'id'
    },
    field: 'building_id'
  },
  roomNumber: {
    type: sequelize.Sequelize.STRING(20),
    allowNull: false,
    field: 'room_number'
  },
  floor: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false
  },
  area: sequelize.Sequelize.DECIMAL(10, 2),
  status: {
    type: sequelize.Sequelize.ENUM('vacant', 'occupied', 'maintenance'),
    defaultValue: 'vacant'
  }
}, {
  tableName: 'rooms',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['building_id', 'room_number']
    }
  ]
});

// 定义关联关系
Garden.hasMany(Building, { foreignKey: 'garden_id' });
Building.belongsTo(Garden, { foreignKey: 'garden_id' });
Building.hasMany(Room, { foreignKey: 'building_id' });
Room.belongsTo(Building, { foreignKey: 'building_id' });

async function syncDatabase(force = false) {
  try {
    console.log('🔄 开始同步数据库结构...');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步模型到数据库
    await sequelize.sync({ force, alter: !force });
    
    if (force) {
      console.log('⚠️  强制重新创建所有表 (所有数据将丢失)');
      
      // 插入示例数据
      await insertSampleData();
    } else {
      console.log('✅ 数据库结构同步完成 (保留现有数据)');
    }
    
    console.log('🎉 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  }
}

async function insertSampleData() {
  console.log('📝 插入示例数据...');
  
  try {
    // 创建园区
    const gardens = await Garden.bulkCreate([
      { name: '阳光花园', address: '北京市朝阳区阳光大街123号', description: '高端住宅小区' },
      { name: '绿色家园', address: '北京市海淀区绿色路456号', description: '生态友好型社区' }
    ]);
    
    // 创建建筑
    const buildings = await Building.bulkCreate([
      { gardenId: gardens[0].id, name: 'A栋', address: '阳光花园A栋', totalFloors: 20, totalRooms: 160 },
      { gardenId: gardens[0].id, name: 'B栋', address: '阳光花园B栋', totalFloors: 18, totalRooms: 144 },
      { gardenId: gardens[1].id, name: 'C栋', address: '绿色家园C栋', totalFloors: 15, totalRooms: 120 }
    ]);
    
    // 创建房间
    await Room.bulkCreate([
      { buildingId: buildings[0].id, roomNumber: '101', floor: 1, area: 85.5, status: 'occupied' },
      { buildingId: buildings[0].id, roomNumber: '102', floor: 1, area: 92.0, status: 'vacant' },
      { buildingId: buildings[0].id, roomNumber: '201', floor: 2, area: 85.5, status: 'occupied' },
      { buildingId: buildings[1].id, roomNumber: '101', floor: 1, area: 78.0, status: 'vacant' },
      { buildingId: buildings[1].id, roomNumber: '102', floor: 1, area: 82.5, status: 'maintenance' }
    ]);
    
    console.log('✅ 示例数据插入完成');
    
  } catch (error) {
    console.error('❌ 示例数据插入失败:', error);
    throw error;
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');

if (require.main === module) {
  syncDatabase(force)
    .then(() => {
      console.log('✨ 数据库迁移任务完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 数据库迁移任务失败:', error);
      process.exit(1);
    });
}

module.exports = {
  syncDatabase,
  insertSampleData,
  models: { User, Garden, Building, Room }
};
