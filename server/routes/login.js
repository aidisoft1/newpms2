// login.js
// 独立的登录API路由模块 - PostgreSQL版本
const express = require('express');
const bcrypt = require('bcryptjs');

// 引入数据库配置
const { sequelize } = require('../config/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { number, password } = req.body;
  if (!number || !password) {
    return res.json({ code: 1, msg: '账号和密码不能为空' });
  }
  
  try {
    // 使用Sequelize查询用户
    const [results] = await sequelize.query(
      'SELECT id, username as number, password_hash as password FROM users WHERE username = :number',
      {
        replacements: { number },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        delete user.password;
        return res.json({ code: 0, user, token: 'mock-token' });
      } else {
        return res.json({ code: 2, msg: '账号或密码错误' });
      }
    } else {
      return res.json({ code: 2, msg: '账号或密码错误' });
    }
  } catch (error) {
    console.error('登录错误:', error);
    return res.json({ code: 3, msg: '服务器内部错误' });
  }
});

// 创建测试用户的路由 (开发时使用)
router.post('/create-test-user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await sequelize.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (:username, :email, :password, :role)',
      {
        replacements: {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin'
        }
      }
    );
    res.json({ code: 0, msg: '测试用户创建成功 (用户名: admin, 密码: 123456)' });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.json({ code: 1, msg: '创建用户失败: ' + error.message });
  }
});

module.exports = router;
