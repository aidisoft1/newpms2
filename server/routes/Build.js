const express = require('express');
const router = express.Router();
const Build = require('../models/Build');

// 获取所有楼栋
// 支持根据查询参数过滤
const { Op } = require('sequelize');
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.BuildName) {
      where.BuildName = { [Op.like]: `%${req.query.BuildName}%` };
    }
    if (req.query.BuildID) {
      where.BuildID = { [Op.like]: `%${req.query.BuildID}%` };
    }
    if (req.query.Note) {
      where.Note = { [Op.like]: `%${req.query.Note}%` };
    }
    const Builds = await Build.findAll({ where });
    res.json(Builds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增楼栋
router.post('/', async (req, res) => {
  try {
    const build = await Build.create(req.body);
    res.json(build);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改楼栋
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Build.update(req.body, { where: { Id: req.params.id } });
    if (updated) {
      const build = await Build.findByPk(req.params.id);
      res.json(build);
    } else {
      res.status(404).json({ error: '未找到该楼栋' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除楼栋
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Build.destroy({ where: { Id: req.params.id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '未找到该楼栋' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
