import { PrismaClient } from '@prisma/client'

// 自动重试初始化 + Proxy 延迟访问，避免在模块导入阶段直接抛错
let prisma: PrismaClient | null = null
let initError: any = null

async function createWithRetry(maxRetries = Number(process.env.PRISMA_INIT_RETRIES || 10), delayMs = Number(process.env.PRISMA_INIT_DELAY || 2000)) {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const client = new PrismaClient()
			await client.$queryRaw`SELECT 1` // 轻量连通性检测
			if (attempt > 0) console.log(`[prisma] connected after retry #${attempt}`)
			else console.log('[prisma] connected on first attempt')
			return client
		} catch (err: any) {
			initError = err
			const msg = err?.code || err?.message || String(err)
			console.warn(`[prisma] init attempt ${attempt} failed: ${msg}`)
			if (attempt === maxRetries) {
				console.error('[prisma] giving up after max retries')
				throw err
			}
			await new Promise(r => setTimeout(r, delayMs))
		}
	}
	throw new Error('unreachable')
}

const initializing: Promise<void> = (async () => {
	prisma = await createWithRetry()
})().catch(e => {
	initError = e
	// 不在此抛出，让访问时抛，便于上层统一处理
})

export const prismaReady = async () => {
	await initializing
	if (!prisma) throw initError || new Error('Prisma not initialized')
	return prisma
}

// 导出一个 Proxy，在真正调用属性时如果尚未 ready 则抛出，启动流程里 index.ts 会等待 prismaReady()
const prismaProxy = new Proxy({}, {
	get(_target, prop) {
		if (!prisma) {
			throw initError || new Error('Prisma not ready yet (initializing)')
		}
		// @ts-ignore
		const value = prisma[prop]
		if (typeof value === 'function') {
			return value.bind(prisma)
		}
		return value
	}
}) as unknown as PrismaClient

export default prismaProxy
