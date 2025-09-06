// 测试404错误的诊断脚本
const axios = require('axios');

async function diagnoseAPI() {
  const baseURL = 'http://192.168.1.10:3000';
  
  console.log('🔍 诊断管理区API 404错误...\n');
  
  // 测试所有可能的API路径
  const testPaths = [
    '/api/gardens',
    '/api/Garden',
    '/api/garden',
    '/gardens',
    '/Garden'
  ];
  
  for (const path of testPaths) {
    try {
      console.log(`测试路径: ${path}`);
      const response = await axios.get(`${baseURL}${path}`);
      console.log(`✅ ${path} - 状态码: ${response.status}`);
      console.log(`   响应类型: ${typeof response.data}`);
      console.log(`   是否为数组: ${Array.isArray(response.data)}\n`);
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${path} - 状态码: ${error.response.status}`);
        console.log(`   错误信息: ${error.response.data?.error || '无详细信息'}\n`);
      } else {
        console.log(`❌ ${path} - 连接错误: ${error.message}\n`);
      }
    }
  }
  
  // 测试POST请求
  console.log('📝 测试POST请求...');
  const testData = {
    name: 'API测试管理区',
    address: '测试地址',
    description: '这是API测试数据'
  };
  
  try {
    const response = await axios.post(`${baseURL}/api/gardens`, testData);
    console.log('✅ POST /api/gardens 成功');
    console.log('   响应:', response.data);
  } catch (error) {
    if (error.response) {
      console.log(`❌ POST /api/gardens - 状态码: ${error.response.status}`);
      console.log(`   错误信息:`, error.response.data);
    } else {
      console.log(`❌ POST /api/gardens - 连接错误: ${error.message}`);
    }
  }
}

// 检查服务器状态
async function checkServerHealth() {
  try {
    console.log('🔍 检查服务器健康状态...');
    
    // 测试基础路径
    const response = await axios.get('http://192.168.1.10:3000');
    console.log('✅ 服务器响应正常');
    
    // 列出所有路由（如果有调试端点）
    try {
      const routesResponse = await axios.get('http://192.168.1.10:3000/api');
      console.log('📋 API根路径响应:', routesResponse.data);
    } catch (err) {
      console.log('💡 /api 根路径不可用');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 服务器未启动，请运行: npm start');
      return false;
    } else {
      console.log('⚠️ 服务器状态检查失败:', error.message);
    }
  }
  return true;
}

async function main() {
  console.log('='.repeat(60));
  console.log('管理区API 404错误诊断工具');
  console.log('='.repeat(60));
  
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await diagnoseAPI();
  
  console.log('\n💡 解决建议:');
  console.log('1. 确保后端服务正在运行: npm start');
  console.log('2. 检查server.js中的路由配置');
  console.log('3. 确认Garden.js路由文件正确导出');
  console.log('4. 检查数据库连接和表结构');
}

main().catch(console.error);
