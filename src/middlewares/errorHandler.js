const { AjaxResult } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(AjaxResult.error('认证失败', 401));
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json(AjaxResult.error(err.message, 400));
  }

  res.status(500).json(AjaxResult.error(err.message || '服务器内部错误', 500));
};

module.exports = errorHandler;
