// 测试管理区API是否正常工作
const axios = require('axios');

async function testGardensAPI() {
  const baseURL = 'http://192.168.1.10:3000';
  
  console.log('🧪 测试管理区 API...\n');
  
  try {
    // 测试获取管理区列表
    console.log('1. 测试 GET /api/gardens');
    const getResponse = await axios.get(`${baseURL}/api/gardens`);
    console.log('✅ 状态码:', getResponse.status);
    console.log('📊 响应数据类型:', typeof getResponse.data);
    console.log('📊 响应数据:', getResponse.data);
    console.log('📊 是否为数组:', Array.isArray(getResponse.data));
    
    if (Array.isArray(getResponse.data)) {
      console.log(`📋 找到 ${getResponse.data.length} 条管理区记录`);
    } else {
      console.log('⚠️ 响应数据不是数组格式');
    }
    
    console.log('\n---\n');
    
    // 测试创建新管理区
    console.log('2. 测试 POST /api/gardens');
    const testData = {
      name: '测试管理区_' + Date.now(),
      address: '测试地址123号',
      description: '这是一个API测试创建的管理区'
    };
    
    const postResponse = await axios.post(`${baseURL}/api/gardens`, testData);
    console.log('✅ 创建状态码:', postResponse.status);
    console.log('📊 创建响应:', postResponse.data);
    
    console.log('\n---\n');
    
    // 再次获取列表确认新增成功
    console.log('3. 再次获取列表确认新增');
    const getResponse2 = await axios.get(`${baseURL}/api/gardens`);
    console.log('✅ 状态码:', getResponse2.status);
    console.log(`📋 现在有 ${getResponse2.data.length} 条管理区记录`);
    
    console.log('\n🎉 API 测试完成！');
    
  } catch (error) {
    console.error('❌ API 测试失败:', error.message);
    
    if (error.response) {
      console.error('📡 响应状态:', error.response.status);
      console.error('📊 响应数据:', error.response.data);
    } else if (error.request) {
      console.error('🔌 无法连接到服务器，请确保后端服务正在运行');
      console.error('   运行命令: npm start');
    } else {
      console.error('⚠️ 其他错误:', error.message);
    }
  }
}

// 检查后端服务是否运行
async function checkServerStatus() {
  try {
    const response = await axios.get('http://192.168.1.10:3000/api/gardens');
    console.log('✅ 后端服务正在运行');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 后端服务未启动');
      console.error('💡 请先运行: npm start');
      return false;
    }
    throw error;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('管理区 API 测试工具');
  console.log('='.repeat(50));
  
  // 先检查服务状态
  const isServerRunning = await checkServerStatus();
  if (!isServerRunning) {
    process.exit(1);
  }
  
  // 运行API测试
  await testGardensAPI();
}

main().catch(console.error);
