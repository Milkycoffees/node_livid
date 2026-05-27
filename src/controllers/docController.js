const path = require('path');
const swaggerSpec = require('../config/swagger');

exports.getDocPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/doc.html'));
};

exports.getSwaggerJson = (req, res) => {
  res.json(swaggerSpec);
};
