import { Request, Response, NextFunction } from 'express'

// 简单 token 校验中间件（生产建议用 JWT 并完善用户体系）
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '')
  if (!token || token !== 'test-token') {
    return res.status(401).json({ error: '未授权' })
  }
  next()
}
