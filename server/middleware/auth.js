// server/middleware/auth.js
// 简单的登录校验中间件（基于 mock-token，可根据实际需求扩展 JWT 等）

module.exports = function (req, res, next) {
  // 允许登录接口和静态资源直接通过
  if (req.path === '/api/login' || req.path.startsWith('/public')) {
    return next();
  }
  // 检查 token（可根据实际需求改为 JWT 校验）
  const token = req.headers['authorization'] || req.query.token;
  if (token === 'mock-token') {
    return next();
  }
  return res.status(401).json({ code: 401, msg: '请先登录' });
};
