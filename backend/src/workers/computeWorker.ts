import { parentPort } from 'worker_threads'
import dayjs from 'dayjs'

if (!parentPort) throw new Error('worker must be run as worker')

parentPort.on('message', (msg: any) => {
  const rooms = msg.rooms || []
  // simple formula: baseRate * area * daysFactor (days in month / 30)
  const baseRate = 1.5 // 元/平米/天 示例
  const results = rooms.map((r: any) => {
    const area = Number(r.size || 0)
    const daysFactor = 30 / 30
    const amount = +(baseRate * area * daysFactor).toFixed(2)
    return { id: r.id, roomId: r.roomId, amount }
  })
  parentPort!.postMessage({ computedAt: dayjs().toISOString(), results })
})
