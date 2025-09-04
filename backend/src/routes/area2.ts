import express from 'express'
import { requireAuth } from '../middleware/auth'
import prisma from '../prismaClient'

const router = express.Router()
// 使用共享 prisma

// GET /api/area2?page=1&size=20&search=xxx&sort=createdAt:desc
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const size = Math.max(1, Math.min(100, parseInt(req.query.size as string) || 20))
    const search = (req.query.search as string) || ''
    const sort = (req.query.sort as string) || 'code:asc'
    let [sortField, sortOrder] = sort.split(':')
    const allowed = new Set(['code','createdAt','name','id'])
    if (!allowed.has(sortField)) sortField = 'code'
    sortOrder = sortOrder === 'desc' ? 'desc' : 'asc'
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } }
      ]
    } : {}
    const total = await prisma.area.count({ where })
    const list = await prisma.area.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * size,
      take: size
    })
    res.json({ total, page, size, list, sort: `${sortField}:${sortOrder}` })
  } catch (e:any) {
    console.error('[GET /api/area2] list error', e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/area2/:id
// GET /api/area2/:id/tree  (在普通 :id 之前声明)
router.get('/:id/tree', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'bad id' })
  try {
    const area = await prisma.area.findUnique({ where: { id } })
    if (!area) return res.status(404).json({ error: 'not found' })
    const [buildings, rooms] = await Promise.all([
      prisma.building.findMany({ where: { areaId: id }, orderBy: { id: 'asc' } }),
      prisma.room.findMany({ where: { areaId: id }, orderBy: { id: 'asc' } })
    ])
    // 组装楼宇下的房间
    const roomsByBuilding = new Map<number, any[]>()
    for (const r of rooms) {
      const arr = roomsByBuilding.get(r.buildingId) || []
      arr.push(r)
      roomsByBuilding.set(r.buildingId, arr)
    }
    const buildingNodes = buildings.map(b => ({ ...b, rooms: roomsByBuilding.get(b.id) || [] }))
    res.json({ area, buildings: buildingNodes, counts: { buildings: buildings.length, rooms: rooms.length } })
  } catch (e: any) {
    console.error('[GET /api/area2/:id/tree] error', e)
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  const area = await prisma.area.findUnique({ where: { id: Number(req.params.id) } })
  if (!area) return res.status(404).json({ error: 'not found' })
  res.json(area)
})

// POST /api/area2
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, code, description,
      lowBuildingCount = 0, highBuildingCount = 0,
      buildArea = 0, landArea = 0, publicArea = 0, greenArea = 0,
      roadArea = 0, parkingArea = 0, garageArea = 0 } = req.body || {}
    if (!name || !code) return res.status(400).json({ error: 'name/code 必填' })
    const area = await prisma.area.create({
      data: { name, code, description,
        lowBuildingCount:Number(lowBuildingCount)||0,
        highBuildingCount:Number(highBuildingCount)||0,
        buildArea:Number(buildArea)||0,
        landArea:Number(landArea)||0,
        publicArea:Number(publicArea)||0,
        greenArea:Number(greenArea)||0,
        roadArea:Number(roadArea)||0,
        parkingArea:Number(parkingArea)||0,
        garageArea:Number(garageArea)||0 }
    })
    res.status(201).json(area)
  } catch (e: any) {
    console.error('[POST /api/area2] error:', e)
    if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/area2/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, code, description,
      lowBuildingCount, highBuildingCount, buildArea, landArea, publicArea, greenArea,
      roadArea, parkingArea, garageArea } = req.body || {}
    const area = await prisma.area.update({
      where: { id: Number(req.params.id) },
      data: { name, code, description,
        lowBuildingCount:Number(lowBuildingCount)||0,
        highBuildingCount:Number(highBuildingCount)||0,
        buildArea:Number(buildArea)||0,
        landArea:Number(landArea)||0,
        publicArea:Number(publicArea)||0,
        greenArea:Number(greenArea)||0,
        roadArea:Number(roadArea)||0,
        parkingArea:Number(parkingArea)||0,
        garageArea:Number(garageArea)||0 }
    })
    res.json(area)
  } catch (e: any) {
    console.error('[PUT /api/area2/:id] error:', e)
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
    if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/area2/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.area.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
    res.status(500).json({ error: e.message })
  }
})

export default router
