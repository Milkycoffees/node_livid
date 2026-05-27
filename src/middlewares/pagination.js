const paginationMiddleware = (req, res, next) => {
  const pageNum = parseInt(req.query.pageNum, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  
  req.pagination = {
    pageNum: Math.max(1, pageNum),
    pageSize: Math.min(100, Math.max(1, pageSize)),
    offset: (Math.max(1, pageNum) - 1) * Math.min(100, Math.max(1, pageSize)),
  };
  
  next();
};

module.exports = paginationMiddleware;
