const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 日志工具
const log = (...args) => console.log('[Customer]', ...args);

// 获取所有客户
router.get('/', async (req, res) => {
  try {
    const data = await Customer.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增客户
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 编辑客户
router.put('/:id', async (req, res) => {
  try {
    await Customer.update(req.body, { where: { Id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除客户
router.delete('/:id', async (req, res) => {
  try {
    await Customer.destroy({ where: { Id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
