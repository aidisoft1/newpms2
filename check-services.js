// 简单测试脚本检查端口和API
const http = require('http');

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '192.168.1.10',
      port: port,
      method: 'GET',
      path: '/',
      timeout: 3000
    }, (res) => {
      console.log(`✅ 端口 ${port} 可访问，状态码: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log(`❌ 端口 ${port} 不可访问`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`⏱️  端口 ${port} 超时`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('🔍 检查后端服务状态...\n');
  
  const port3000 = await checkPort(3000);
  const port5173 = await checkPort(5173); // 前端端口
  
  console.log('\n📊 端口状态总结:');
  console.log(`  - 3000 (后端): ${port3000 ? '✅ 运行中' : '❌ 未运行'}`);
  console.log(`  - 5173 (前端): ${port5173 ? '✅ 运行中' : '❌ 未运行'}`);
  
  if (!port3000) {
    console.log('\n💡 启动后端服务建议:');
    console.log('   1. 确保在 d:\\newpms2 目录下');
    console.log('   2. 运行: node server.js');
    console.log('   3. 或者运行: npm start');
  }
  
  if (!port5173) {
    console.log('\n💡 启动前端服务建议:');
    console.log('   1. 确保在 d:\\newpms2 目录下');
    console.log('   2. 运行: npm run dev');
  }
}

main().catch(console.error);
