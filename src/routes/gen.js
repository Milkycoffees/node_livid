const express = require('express');
const router = express.Router();
const genController = require('../controllers/genController');
const authMiddleware = require('../middlewares/auth');
const paginationMiddleware = require('../middlewares/pagination');

router.get('/list', authMiddleware, paginationMiddleware, genController.list);
router.get('/db/list', authMiddleware, paginationMiddleware, genController.dbList);
router.get('/preview/:tableId', authMiddleware, genController.preview);
router.get('/download/:tableName', authMiddleware, genController.download);
router.get('/batchGenCode', authMiddleware, genController.batchGenCode);
router.get('/:tableId', authMiddleware, genController.getInfo);
router.post('/import', authMiddleware, genController.importTable);
router.put('/', authMiddleware, genController.updateTable);
router.delete('/:tableIds', authMiddleware, genController.remove);

module.exports = router;
