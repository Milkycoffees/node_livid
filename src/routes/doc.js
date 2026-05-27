const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');

router.get('/doc.html', docController.getDocPage);
router.get('/api-docs-json', docController.getSwaggerJson);

module.exports = router;
