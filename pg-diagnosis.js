// PostgreSQL连接诊断工具
console.log('🔍 PostgreSQL连接诊断开始...\n');

// 1. 检查Node.js和npm环境
console.log('1️⃣ 检查Node.js环境:');
console.log('   Node.js版本:', process.version);
console.log('   工作目录:', process.cwd());

// 2. 检查pg模块
console.log('\n2️⃣ 检查pg模块:');
try {
  const pg = require('pg');
  console.log('   ✅ pg模块加载成功');
  console.log('   版本:', pg.version || 'unknown');
} catch (error) {
  console.log('   ❌ pg模块加载失败:', error.message);
  console.log('   💡 请运行: npm install pg');
  process.exit(1);
}

// 3. 检查环境变量
console.log('\n3️⃣ 检查环境变量:');
try {
  require('dotenv').config();
  console.log('   ✅ dotenv加载成功');
} catch (error) {
  console.log('   ⚠️  dotenv加载失败, 使用默认配置');
}

const config = {
  host: process.env.DB_HOST || '192.168.1.10',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sample',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aidisoft'
};

console.log('   配置信息:');
console.log('   - 主机:', config.host);
console.log('   - 端口:', config.port);
console.log('   - 数据库:', config.database);
console.log('   - 用户:', config.user);
console.log('   - 密码:', '***');

// 4. 测试连接
console.log('\n4️⃣ 测试数据库连接:');
const { Client } = require('pg');
const client = new Client(config);

client.connect()
  .then(() => {
    console.log('   ✅ 连接成功!');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('   📊 PostgreSQL信息:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    return client.query('SELECT current_database()');
  })
  .then(result => {
    console.log('   📂 当前数据库:', result.rows[0].current_database);
    return client.end();
  })
  .then(() => {
    console.log('\n🎉 所有检查通过！PostgreSQL连接正常');
  })
  .catch(error => {
    console.log('\n❌ 连接失败:');
    console.log('   错误:', error.message);
    console.log('   代码:', error.code);
    
    console.log('\n💡 故障排除建议:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔧 连接被拒绝 - PostgreSQL服务可能未启动');
      console.log('   请检查:');
      console.log('   - Windows服务中的PostgreSQL服务是否运行');
      console.log('   - 或运行: net start postgresql-x64-15');
      console.log('   - 检查端口5432是否被占用');
    } else if (error.code === '28P01') {
      console.log('   🔐 密码认证失败');
      console.log('   请检查:');
      console.log('   - 用户名和密码是否正确');
      console.log('   - pg_hba.conf配置');
    } else if (error.code === '3D000') {
      console.log('   📂 数据库不存在');
      console.log('   请先创建数据库: CREATE DATABASE sample;');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   🌐 主机名解析失败');
      console.log('   请检查主机名是否正确');
    }
    
    console.log('\n📞 如需帮助，请提供上述错误信息');
    client.end().catch(() => {});
  });

// 5. 超时处理
setTimeout(() => {
  console.log('\n⏰ 连接超时 (30秒)');
  console.log('可能的原因:');
  console.log('- PostgreSQL服务未启动');
  console.log('- 网络连接问题');
  console.log('- 防火墙阻止连接');
  process.exit(1);
}, 30000);
