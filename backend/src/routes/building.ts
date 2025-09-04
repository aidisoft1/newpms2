import express from 'express'
import prisma from '../prismaClient'
import { requireAuth } from '../middleware/auth'

const router = express.Router()

// 查询楼宇列表: /api/buildings?areaId=1&search=xxx
router.get('/', requireAuth, async (req, res) => {
	try {
		const areaId = req.query.areaId ? Number(req.query.areaId) : undefined
		const search = (req.query.search as string) || ''
		const where: any = {}
		if (areaId) where.areaId = areaId
		if (search) where.OR = [
			{ name: { contains: search } },
			{ code: { contains: search } },
			{ address: { contains: search } }
		]
		const list = await prisma.building.findMany({ where, orderBy: { id: 'desc' } })
		res.json(list)
	} catch (e: any) {
		res.status(500).json({ error: e.message })
	}
})

router.get('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		const b = await prisma.building.findUnique({ where: { id } })
		if (!b) return res.status(404).json({ error: 'not found' })
		res.json(b)
	} catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, async (req, res) => {
	try {
		let { name, code, areaId, areaCode, description, floors, units, buildArea, landArea, address, buildingType, buildingStructure, orientation, remark } = req.body || {}
		if (!name || !code) return res.status(400).json({ error: 'name/code 必填' })
		// 1) 支持前端传真正的 area 主键 id，或传 areaCode（管理区编号/代码）
		let resolvedAreaId: number | null = null
		if (areaId != null && areaId !== '') {
			const n = Number(areaId)
			if (!Number.isNaN(n) && n > 0) resolvedAreaId = n
		}
		if (!resolvedAreaId && areaCode) {
			const area = await prisma.area.findUnique({ where: { code: String(areaCode) } })
			if (area) resolvedAreaId = area.id
		}
		if (!resolvedAreaId) {
			return res.status(400).json({ error: '缺少有效的管理区标识 (areaId 或 areaCode)' })
		}
		// 确认管理区存在（防止外键异常）
		const areaExists = await prisma.area.findUnique({ where: { id: resolvedAreaId } })
		if (!areaExists) return res.status(400).json({ error: '管理区不存在: ' + resolvedAreaId })

		const created = await prisma.building.create({
			data: {
				name,
				code,
				areaId: resolvedAreaId,
				description: description || null,
				floors: Number(floors)||0,
				units: Number(units)||0,
				buildArea: Number(buildArea)||0,
				landArea: Number(landArea)||0,
				address: address || null,
				buildingType: buildingType || null,
				buildingStructure: buildingStructure || null,
				orientation: orientation || null,
				remark: remark || null
			}
		})
		res.status(201).json(created)
	} catch (e: any) {
		if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
		if (e.code === 'P2003') return res.status(400).json({ error: '外键约束失败(管理区不存在)，请刷新管理区列表后重试' })
		res.status(500).json({ error: e.message })
	}
})

router.put('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		let { name, code, areaId, areaCode, description, floors, units, buildArea, landArea, address, buildingType, buildingStructure, orientation, remark } = req.body || {}
		let resolvedAreaId: number | undefined = undefined
		if (areaId != null && areaId !== '') {
			const n = Number(areaId)
			if (!Number.isNaN(n) && n > 0) resolvedAreaId = n
		}
		if (!resolvedAreaId && areaCode) {
			const area = await prisma.area.findUnique({ where: { code: String(areaCode) } })
			if (area) resolvedAreaId = area.id
		}
		if (resolvedAreaId) {
			const exists = await prisma.area.findUnique({ where: { id: resolvedAreaId } })
			if (!exists) return res.status(400).json({ error: '管理区不存在: ' + resolvedAreaId })
		}
		const updated = await prisma.building.update({
			where: { id },
			data: {
				name,
				code,
				areaId: resolvedAreaId, // 允许不修改时为 undefined
				description: description || null,
				floors: Number(floors)||0,
				units: Number(units)||0,
				buildArea: Number(buildArea)||0,
				landArea: Number(landArea)||0,
				address: address || null,
				buildingType: buildingType || null,
				buildingStructure: buildingStructure || null,
				orientation: orientation || null,
				remark: remark || null
			}
		})
		res.json(updated)
	} catch (e: any) {
		if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
		if (e.code === 'P2002') return res.status(409).json({ error: 'code 已存在' })
		if (e.code === 'P2003') return res.status(400).json({ error: '外键约束失败(管理区不存在)，请刷新后重试' })
		res.status(500).json({ error: e.message })
	}
})

router.delete('/:id', requireAuth, async (req, res) => {
	try {
		const id = Number(req.params.id)
		await prisma.building.delete({ where: { id } })
		res.status(204).end()
	} catch (e: any) {
		if (e.code === 'P2025') return res.status(404).json({ error: 'not found' })
		res.status(500).json({ error: e.message })
	}
})

export default router
