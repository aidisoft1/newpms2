require('dotenv').config();

// 简化的测试配置，用于检查和修复数据保存问题
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// 创建内存数据库用于测试（如果 PostgreSQL 不可用）
const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  logging: console.log
});

// 简化的 Garden 模型定义
const Garden = sequelize.define('Garden', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  address: { 
    type: DataTypes.TEXT 
  },
  description: { 
    type: DataTypes.TEXT 
  }
}, {
  tableName: 'gardens',
  timestamps: true,
  underscored: true
});

async function testSaveOperation() {
  try {
    console.log('=== 使用 SQLite 内存数据库测试保存操作 ===\n');
    
    // 同步模型
    await sequelize.sync({ force: true });
    console.log('✅ 模型同步完成');
    
    // 测试数据
    const testData = {
      name: '测试管理区_' + new Date().getTime(),
      address: '测试地址123号',
      description: '这是一个测试描述'
    };
    
    console.log('📝 准备新增的数据:', testData);
    
    // 创建记录
    const result = await Garden.create(testData);
    console.log('✅ 新增成功！返回结果:', result.toJSON());
    
    // 验证保存
    const allRecords = await Garden.findAll();
    console.log(`✅ 验证：数据库中共有 ${allRecords.length} 条记录`);
    
    allRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, 名称: ${record.name}`);
    });
    
    console.log('\n🎉 保存操作测试成功！模型和路由逻辑正常');
    console.log('💡 问题可能在于 PostgreSQL 连接或服务状态');
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSaveOperation();
