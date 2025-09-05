require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// 引入数据库配置
const { sequelize } = require('./server/config/database');
const Garden = require('./server/models/Garden');

async function testCreate() {
  try {
    console.log('=== 数据库连接测试 ===');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    console.log('\n=== 同步模型和表结构 ===');
    await sequelize.sync({ force: false });
    console.log('✅ 模型同步完成');
    
    console.log('\n=== 测试新增记录 ===');
    const testData = {
      name: '测试管理区_' + new Date().getTime(),
      address: '测试地址123号',
      description: '这是一个测试描述'
    };
    
    console.log('准备新增的数据:', testData);
    
    const result = await Garden.create(testData);
    console.log('✅ 新增成功！返回结果:', result.toJSON());
    
    console.log('\n=== 查询验证 ===');
    const allGardens = await Garden.findAll();
    console.log(`数据库中共有 ${allGardens.length} 条管理区记录`);
    
    // 显示最新的几条记录
    const latestGardens = await Garden.findAll({ 
      order: [['created_at', 'DESC']], 
      limit: 3 
    });
    console.log('最新的3条记录:');
    latestGardens.forEach(g => {
      console.log(`- ID: ${g.id}, 名称: ${g.name}, 地址: ${g.address}`);
    });
    
    await sequelize.close();
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    if (error.name === 'SequelizeConnectionError') {
      console.error('💡 数据库连接失败，请检查 PostgreSQL 服务是否启动');
    }
    if (error.name === 'SequelizeDatabaseError') {
      console.error('💡 数据库操作失败，可能是表结构问题');
      console.error('详细错误:', error.message);
    }
    process.exit(1);
  }
}

testCreate();
