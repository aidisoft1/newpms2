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
<<<<<<< HEAD
      where.Name = { [Op.like]: `%${req.query.name}%` };
    }
    if (req.query.number) {
      where.Number = { [Op.like]: `%${req.query.number}%` };
=======
      where.name = { [Op.like]: `%${req.query.name}%` };
    }
    if (req.query.address) {
      where.address = { [Op.like]: `%${req.query.address}%` };
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
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
<<<<<<< HEAD
    log('create result:', Garden);
    res.json(Garden);
=======
    log('create result:', result);
    res.json(result);
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 编辑管理区
router.put('/:id', async (req, res) => {
  log('PUT /' + req.params.id, req.body);
  try {
<<<<<<< HEAD
    await Garden.update(req.body, { where: { Id: req.params.id } });
=======
    await Garden.update(req.body, { where: { id: req.params.id } });
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
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
    await Garden.destroy({ where: { id: req.params.id } });
    log('delete success');
    res.json({ success: true });
  } catch (err) {
    log('error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
