import express from 'express'
import type { Request, Response } from 'express'
import { Worker } from 'worker_threads'
import { jsonFileStore } from '../store'

const router = express.Router()

// simple endpoint: return counts
router.get('/stats', (req: Request, res: Response) => {
  const areas = jsonFileStore.read('areas', []) as any[]
  const buildings = jsonFileStore.read('buildings', []) as any[]
  const rooms = jsonFileStore.read('rooms', []) as any[]
  res.json({ areas: areas.length, buildings: buildings.length, rooms: rooms.length })
})

// endpoint to run a compute job on worker thread for provided room ids
router.post('/compute', (req: Request, res: Response) => {
  const roomIds: string[] = req.body.roomIds || []
  const rooms = jsonFileStore.read('rooms', []) as any[]
  const targets = rooms.filter(r=> roomIds.length ? roomIds.includes(r.id) : true)

  const worker = new Worker(require.resolve('../workers/computeWorker'))
  worker.postMessage({ rooms: targets })
  worker.once('message', (result) => {
    res.json({ ok: true, result })
    worker.terminate()
  })
  worker.once('error', (err) => { res.status(500).json({ error: String(err) }); worker.terminate() })
})

export default router
