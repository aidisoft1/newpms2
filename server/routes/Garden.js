const express = require('express');
const router = express.Router();
const Garden = require('../models/Garden');

// 日志工具
const log = (...args) => console.log('[Garden]', ...args);

// 获取所有管理区
router.get('/', async (req, res) => {
  log('GET /');
  try {
    const where = {};
    // Sequelize v6 需用 Op.like
    const { Op } = require('sequelize');
    if (req.query.name) {
      where.Name = { [Op.like]: `%${req.query.name}%` };
    }
    if (req.query.number) {
      where.Number = { [Op.like]: `%${req.query.number}%` };
    }
    const data = await Garden.findAll({ where });
    log('findAll result:', data);
    res.json(data);
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 新增管理区
router.post('/', async (req, res) => {
  log('POST /', req.body);
  try {
    const result = await Garden.create(req.body);
    log('create result:', Garden);
    res.json(Garden);
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 编辑管理区
router.put('/:id', async (req, res) => {
  log('PUT /' + req.params.id, req.body);
  try {
    await Garden.update(req.body, { where: { Id: req.params.id } });
    log('update success');
    res.json({ success: true });
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 删除管理区
router.delete('/:id', async (req, res) => {
  log('DELETE /' + req.params.id);
  try {
    await Garden.destroy({ where: { Id: req.params.id } });
    log('delete success');
    res.json({ success: true });
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
