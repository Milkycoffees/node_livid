const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./user');
const genRoutes = require('./gen');

router.use('/', authRoutes);
router.use('/system/user', userRoutes);
router.use('/tool/gen', genRoutes);

module.exports = router;
