// 测试API连接性和端点可用性
const axios = require('axios');

async function testAPIConnectivity() {
  console.log('🔍 测试API连接性...\n');
  
  const baseURL = 'http://192.168.1.10:3000';
  
  // 测试项目列表
  const tests = [
    { method: 'GET', url: '/api/gardens', desc: '获取管理区列表' },
    { method: 'POST', url: '/api/gardens', desc: '创建管理区', data: { name: '测试管理区', address: '测试地址', description: '测试描述' } }
  ];
  
  for (const test of tests) {
    try {
      console.log(`📡 测试: ${test.method} ${test.url} - ${test.desc}`);
      
      const config = {
        method: test.method.toLowerCase(),
        url: baseURL + test.url,
        headers: {
          'Authorization': 'mock-token',
          'Content-Type': 'application/json'
        }
      };
      
      if (test.data) {
        config.data = test.data;
      }
      
      const response = await axios(config);
      console.log(`✅ 成功: ${response.status} ${response.statusText}`);
      console.log(`📄 响应数据:`, response.data);
      
    } catch (error) {
      console.log(`❌ 失败: ${test.method} ${test.url}`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误信息: ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        console.log(`   网络错误: 无法连接到服务器`);
      } else {
        console.log(`   错误: ${error.message}`);
      }
    }
    console.log(''); // 空行分隔
  }
}

// 首先检查服务器是否在运行
async function checkServerStatus() {
  try {
    console.log('🔍 检查服务器状态...');
    const response = await axios.get('http://192.168.1.10:3000', { timeout: 5000 });
    console.log('✅ 服务器运行正常');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 服务器未运行或端口3000不可用');
      console.log('💡 请先启动后端服务: npm start 或 node server.js');
    } else {
      console.log('❌ 服务器检查失败:', error.message);
    }
    return false;
  }
}

async function main() {
  const serverRunning = await checkServerStatus();
  console.log('');
  
  if (serverRunning) {
    await testAPIConnectivity();
  } else {
    console.log('⚠️  服务器未运行，跳过API测试');
  }
}

main().catch(console.error);
