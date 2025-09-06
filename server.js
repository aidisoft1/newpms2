// 后端API服务，Node.js + Express + PostgreSQL
// 需先安装依赖：npm install express pg sequelize dotenv
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, testConnection } = require('./server/config/database-simple');
const GardenRouter = require('./server/routes/Garden');
const BuildRouter = require('./server/routes/Build');
const RoomRouter = require('./server/routes/Room');
const customerRouter = require('./server/routes/customer');
const loginRouter = require('./server/routes/login');


const app = express();

// 添加CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

// 登录校验中间件，要求先登录才能访问主界面及API
const auth = require('./server/middleware/auth');
app.use(auth);


// 登录API路由
app.use('/api', loginRouter);

// 注册 Build、Garden、customer 路由
app.use('/api/gardens', GardenRouter);  // 修正路由路径
app.use('/api/builds', BuildRouter);
app.use('/api/rooms', RoomRouter);
app.use('/api/customers', customerRouter);

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('❌ 数据库连接失败，服务器启动中止');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://192.168.1.10:${PORT}`);
    console.log(`📊 数据库: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API 端点:`);
    console.log(`   - GET  /api/gardens     - 获取管理区列表`);
    console.log(`   - POST /api/gardens     - 创建管理区`);
    console.log(`   - PUT  /api/gardens/:id - 更新管理区`);
    console.log(`   - DELETE /api/gardens/:id - 删除管理区`);
  });
}

// 启动服务器
startServer().catch(error => {
  console.error('❌ 服务器启动失败:', error);
  process.exit(1);
});
