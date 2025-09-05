// login.js
// 独立的登录API路由模块
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');

// 引入全局 dbConfig
const dbConfig = require('../dbConfig');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { number, password } = req.body;
  if (!number || !password) {
    return res.json({ code: 1, msg: '账号和密码不能为空' });
  }
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('number', sql.VarChar, number)
      .query('SELECT id, number, password FROM t_user WHERE number = @number');
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
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
  } catch (e) {
    return res.json({ code: 500, msg: '服务器异常', error: e.message });
  } finally {
    if (pool) pool.close();
  }
});

module.exports = router;
