const { verifyToken } = require('../utils/jwt');
const { AjaxResult } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json(AjaxResult.error('未提供认证令牌', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(AjaxResult.error('令牌无效或已过期', 401));
  }
};

module.exports = authMiddleware;
