import express from 'express'
import prisma from '../prismaClient'
import { requireAuth } from '../middleware/auth'

const router = express.Router()

// GET /api/rooms?areaId=1&buildingId=2&search=101
router.get('/', requireAuth, async (req, res) => {
	try {
		const areaId = req.query.areaId ? Number(req.query.areaId) : undefined
		const buildingId = req.query.buildingId ? Number(req.query.buildingId) : undefined
		const search = (req.query.search as string) || ''
		const where: any = {}
		if (areaId) where.areaId = areaId
		if (buildingId) where.buildingId = buildingId
		if (search) where.OR = [
			{ roomNo: { contains: search } },
			{ code: { contains: search } },
			{ ownerName: { contains: search } },
			{ customerName: { contains: search } }
		]
		const list = await prisma.room.findMany({ where, orderBy: { id: 'desc' } })
		res.json(list)
	} catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		const r = await prisma.room.findUnique({ where: { id } })
		if (!r) return res.status(404).json({ error: 'not found' })
		res.json(r)
	} catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, async (req, res) => {
	try {
		const { roomNo, code, areaId, buildingId, floor, unit, size, usableArea, orientation, purpose, status, ownerName, customerName, customerId, ownershipType, fitmentStatus, remark } = req.body || {}
		if (!roomNo || !code) return res.status(400).json({ error: 'roomNo/code 必填' })
		if (!areaId || !buildingId) return res.status(400).json({ error: 'areaId/buildingId 必填' })
		// 由于 Prisma Client 类型暂未刷新（ownershipType/fitmentStatus 新增后类型未识别），这里用 any 规避编译错误
		const data: any = {
			roomNo,
			code,
			areaId: Number(areaId),
			buildingId: Number(buildingId),
			floor: Number(floor)||0,
			unit: Number(unit)||0,
			size: Number(size)||0,
			usableArea: Number(usableArea)||0,
			orientation: orientation || null,
			purpose: purpose || null,
			status: status || 'idle',
			ownerName: ownerName || null,
			customerName: customerName || null,
			customerId: customerId || null,
			ownershipType: ownershipType || null,
			fitmentStatus: fitmentStatus || null,
			remark: remark || null
		}
		const created = await prisma.room.create({ data })
		res.status(201).json(created)
	} catch (e: any) {
		if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
		res.status(500).json({ error: e.message })
	}
})

router.put('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		const { roomNo, code, floor, unit, size, usableArea, orientation, purpose, status, ownerName, customerName, customerId, ownershipType, fitmentStatus, remark } = req.body || {}
		const data: any = {
			roomNo,
			code,
			floor: Number(floor)||0,
			unit: Number(unit)||0,
			size: Number(size)||0,
			usableArea: Number(usableArea)||0,
			orientation: orientation || null,
			purpose: purpose || null,
			status: status || 'idle',
			ownerName: ownerName || null,
			customerName: customerName || null,
			customerId: customerId || null,
			ownershipType: ownershipType || null,
			fitmentStatus: fitmentStatus || null,
			remark: remark || null
		}
		const updated = await prisma.room.update({ where: { id }, data })
		res.json(updated)
	} catch (e: any) {
		if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
		if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
		res.status(500).json({ error: e.message })
	}
})

router.delete('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		await prisma.room.delete({ where: { id } })
		res.status(204).end()
	} catch (e: any) {
		if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
		res.status(500).json({ error: e.message })
	}
})

export default router
