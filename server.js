// 后端登录API服务，Node.js + Express + mssql
// 需先安装依赖：npm install express mssql body-parser
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const sequelize = require('./server/dbConfig');
const dbConfig = {
  user: 'sa', password: 'W2Sm1i3KnJR8JkK0', server: 'aidisoft2009.gnway.vip', port: 2433, database: 'Sample', options: { encrypt: false, trustServerCertificate: true }
};
const GardenRouter = require('./server/routes/Garden');
const BuildRouter = require('./server/routes/Build');
const RoomRouter = require('./server/routes/Room');
const customerRouter = require('./server/routes/customer');
const loginRouter = require('./server/routes/login');


const app = express();
app.use(bodyParser.json());

// 登录校验中间件，要求先登录才能访问主界面及API
const auth = require('./server/middleware/auth');
app.use(auth);


// 登录API路由
app.use('/api', loginRouter);

// 注册 Build、Garden、customer 路由
app.use('/api/Garden', GardenRouter);
app.use('/api/Build', BuildRouter);
app.use('/api/Room', RoomRouter);
app.use('/api/customer', customerRouter);

// 测试数据库连接（Sequelize）
sequelize.authenticate()
  .then(() => console.log('Sequelize MSSQL 连接成功'))
  .catch(err => console.error('Sequelize 数据库连接失败:', err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
