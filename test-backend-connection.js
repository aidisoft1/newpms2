// 快速测试后端API连接
const http = require('http');

console.log('🔍 测试后端服务连接...');

// 测试基本连接
function testConnection(url, description) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📄 响应内容: ${data.substring(0, 200)}...`);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: 请求超时`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testAPI() {
  console.log('测试基本连接...');
  await testConnection('http://192.168.1.10:3000/', '基本连接');
  
  console.log('\n测试Gardens API...');
  
  // 测试Gardens API - 需要添加认证头
  const options = {
    hostname: '192.168.1.10',
    port: 3000,
    path: '/api/gardens',
    method: 'GET',
    headers: {
      'Authorization': 'mock-token'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Gardens API: ${res.statusCode} ${res.statusMessage}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`📄 API响应: ${data}`);
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Gardens API: ${err.message}`);
  });
  
  req.setTimeout(5000, () => {
    console.log(`⏰ Gardens API: 请求超时`);
    req.destroy();
  });
  
  req.end();
}

testAPI();
