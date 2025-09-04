import express from 'express'
import { jsonFileStore } from '../store'
const router = express.Router()

type Area = { id: string, name: string }

function loadAreas(): Area[] { return jsonFileStore.read<Area[]>('areas', []) }
function saveAreas(list: Area[]) { jsonFileStore.write('areas', list) }

router.get('/', (req, res) => { res.json(loadAreas()) })
router.get('/:id', (req, res) => { const a = loadAreas().find(x=>x.id===req.params.id); if (!a) return res.status(404).json({error:'not found'}); res.json(a) })
router.post('/', (req, res) => { const list = loadAreas(); const item = { id: String(Date.now()), name: req.body.name || '新管理区' }; list.push(item); saveAreas(list); res.status(201).json(item) })
router.put('/:id', (req, res) => { const list = loadAreas(); const idx = list.findIndex(x=>x.id===req.params.id); if (idx===-1) return res.status(404).json({error:'not found'}); list[idx] = { ...list[idx], ...req.body }; saveAreas(list); res.json(list[idx]) })
router.delete('/:id', (req, res) => { const list = loadAreas().filter(x=>x.id!==req.params.id); saveAreas(list); res.status(204).end() })

export default router
