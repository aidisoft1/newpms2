const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// 获取所有房间
const { Op } = require('sequelize');

// 获取所有房间（支持模糊查询）
router.get('/', async (req, res) => {
  try {
    const where = {};
<<<<<<< HEAD
    if (req.query.RoomName) {
      where.RoomName = { [Op.like]: `%${req.query.RoomName}%` };
    }
    if (req.query.RoomID) {
      where.RoomID = { [Op.like]: `%${req.query.RoomID}%` };
    }
    if (req.query.Build_ID) {
      where.Build_ID = req.query.Build_ID;
    }
    if (req.query.Note) {
      where.Note = { [Op.like]: `%${req.query.Note}%` };
=======
    if (req.query.name) {
      where.name = { [Op.like]: `%${req.query.name}%` };
    }
    if (req.query.roomNumber) {
      where.roomNumber = { [Op.like]: `%${req.query.roomNumber}%` };
    }
    if (req.query.buildingId) {
      where.buildingId = req.query.buildingId;
    }
    if (req.query.description) {
      where.description = { [Op.like]: `%${req.query.description}%` };
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
    }
    const Rooms = await Room.findAll({ where });
    res.json(Rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增房间
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 编辑房间
router.put('/:id', async (req, res) => {
  try {
    await Room.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除房间
router.delete('/:id', async (req, res) => {
  try {
    await Room.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
