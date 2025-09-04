import express from 'express'
import prisma from '../prismaClient'
import { requireAuth } from '../middleware/auth'

// 提供数据库概要统计: /api/db/summary?details=1
// 默认只返回 counts; 传 details=1 时附带最近 5 条记录
const router = express.Router()

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const details = req.query.details === '1' || req.query.details === 'true'

    const [areaCount, buildingCount, roomCount, areaAgg, buildingAgg, roomAgg] = await Promise.all([
      prisma.area.count(),
      prisma.building.count(),
      prisma.room.count(),
      prisma.area.aggregate({
        _sum: {
          buildArea: true, landArea: true, publicArea: true, greenArea: true,
          roadArea: true, parkingArea: true, garageArea: true
        }
      }),
      prisma.building.aggregate({ _sum: { buildArea: true, landArea: true } }),
      prisma.room.aggregate({ _sum: { size: true, usableArea: true } })
    ])

    let latest: any = undefined
    if (details) {
      const [latestAreas, latestBuildings, latestRooms] = await Promise.all([
        prisma.area.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.building.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.room.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
      ])
      latest = { areas: latestAreas, buildings: latestBuildings, rooms: latestRooms }
    }

    res.json({
      status: 'ok',
      ts: new Date().toISOString(),
      counts: { areas: areaCount, buildings: buildingCount, rooms: roomCount },
      sums: {
        area: areaAgg._sum,
        building: buildingAgg._sum,
        room: roomAgg._sum
      },
      latest
    })
  } catch (e: any) {
    console.error('[GET /api/db/summary] error:', e)
    res.status(500).json({ error: e.message || 'internal error' })
  }
})

export default router
