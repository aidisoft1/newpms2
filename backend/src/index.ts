import express from 'express'
import cors from 'cors'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { jsonFileStore } from './store'
import { prismaReady } from './prismaClient'
import areaRouter from './routes/area'
import area2Router from './routes/area2'
import buildingRouter from './routes/building'
import roomRouter from './routes/room'
import dashboardRouter from './routes/dashboard'
import dbRouter from './routes/dbSummary'
import customersRouter from './routes/customers'
// 临时移除尚未完成的 meter 路由（schema 未包含相关模型）

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/areas', areaRouter)
app.use('/api/area2', area2Router)
app.use('/api/buildings', buildingRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/db', dbRouter)
app.use('/api/customers', customersRouter)

// define host/port early so handlers can use them
const PORT = Number(process.env.PORT || 4000)
const HOST = process.env.HOST || '0.0.0.0'

// root info page
app.get('/', (req, res) => {
  res.send(`Property backend is running. Available APIs:\n
  GET /api/areas\n  GET /api/buildings\n  GET /api/rooms\n  GET /api/dashboard/stats\n  POST /api/dashboard/compute { roomIds: [] }\n`)
})

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), pid: process.pid, port: PORT })
})

function startServer() {
  const server = app.listen(PORT, HOST, () => {
  const addr = server.address()
  console.log(`Backend running and listening on ${JSON.stringify(addr)} (host ${HOST})`)

  // internal self-check: request our own /health and write a file backend/internal_ready.json
  try {
    const checkUrl = `http://127.0.0.1:${PORT}/health`
    const timeoutMs = 3000
    const req = http.get(checkUrl, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        const out = {
          ok: res.statusCode === 200,
          statusCode: res.statusCode,
          headers: res.headers,
          body: safeParse(body),
          ts: new Date().toISOString(),
        }
        writeReadyFile(out)
      })
    })
    req.on('error', (err) => {
      writeReadyFile({ ok: false, error: String(err), ts: new Date().toISOString() })
    })
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'))
    })
  } catch (err) {
    writeReadyFile({ ok: false, error: String(err), ts: new Date().toISOString() })
  }
  })

  server.on('error', (err: any) => {
    console.error('Server error while binding:', err && err.code ? err.code : err)
    process.exit(1)
  })
}

// 等待 prisma 初始化（带重试）后再启动 http server
;(async () => {
  try {
    console.log('[bootstrap] waiting prisma connection...')
    await prismaReady()
    console.log('[bootstrap] prisma ready, starting http server')
    startServer()
  } catch (err) {
    console.error('[bootstrap] failed to initialize prisma, exit.', err)
    process.exit(1)
  }
})()
function safeParse(s: string) {
  try {
    return JSON.parse(s)
  } catch (e) {
    return s
  }
}

function writeReadyFile(obj: any) {
  try {
    const outDir = path.resolve(__dirname, '..')
    const fp = path.join(outDir, 'internal_ready.json')
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2), { encoding: 'utf8' })
    console.log('Wrote internal ready file:', fp)
  } catch (err) {
    console.error('Failed to write internal ready file:', err)
  }
}
// server error handler moved into startServer()
