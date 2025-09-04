import express from 'express'
import prisma from '../prismaClient'
import { requireAuth } from '../middleware/auth'

const router = express.Router()

// GET /api/customers?room_id=123
router.get('/', requireAuth, async (req, res) => {
  try {
    const roomId = req.query.room_id ? Number(req.query.room_id) : undefined
    const list = await (prisma as any).customer.findMany({
      where: roomId ? { roomId } : {},
      include: { room: { select: { id: true, code: true, roomNo: true, buildingId: true } } },
      orderBy: { id: 'desc' }
    })
    res.json(list.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      idNumber: c.idNumber,
      roomId: c.roomId,
      roomCode: c.roomCode || c.room?.code || c.room?.roomNo || null,
      buildingId: c.room?.buildingId || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    })))
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/customers
router.post('/', requireAuth, async (req, res) => {
  try {
  const { name, phone, id_number, room_id, room_code } = req.body || {}
    if (!name) return res.status(400).json({ error: 'name required' })
    let roomConnect: number | null = null
    if (room_id) {
      const r = await prisma.room.findUnique({ where: { id: Number(room_id) } })
      if (!r) return res.status(400).json({ error: 'room_id invalid' })
      roomConnect = r.id
    }
  const created = await (prisma as any).customer.create({ data: { name, phone, idNumber: id_number || null, roomId: roomConnect, roomCode: room_code || null } })
    res.status(201).json({
      id: created.id,
      name: created.name,
      phone: created.phone,
      idNumber: created.idNumber,
  roomId: created.roomId,
  roomCode: created.roomCode,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/customers/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
  const { name, phone, id_number, room_id, room_code } = req.body || {}
    let roomConnect: number | null | undefined = undefined
    if (room_id !== undefined) {
      if (room_id === null || room_id === '') roomConnect = null
      else {
        const r = await prisma.room.findUnique({ where: { id: Number(room_id) } })
        if (!r) return res.status(400).json({ error: 'room_id invalid' })
        roomConnect = r.id
      }
    }
  const data: any = { name, phone, idNumber: id_number, roomCode: room_code }
    if (roomConnect !== undefined) data.roomId = roomConnect
    const updated = await (prisma as any).customer.update({ where: { id }, data })
    res.json({
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      idNumber: updated.idNumber,
      roomId: updated.roomId,
      roomCode: updated.roomCode,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    })
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/customers/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
  await (prisma as any).customer.delete({ where: { id } })
    res.status(204).end()
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
    res.status(500).json({ error: e.message })
  }
})

export default router
