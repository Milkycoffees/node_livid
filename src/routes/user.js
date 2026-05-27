const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const paginationMiddleware = require('../middlewares/pagination');

/**
 * @swagger
 * /dev-api/system/user/list:
 *   get:
 *     tags: [用户管理]
 *     summary: 用户列表
 *     description: 分页查询用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: 每页数量
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: 用户名（模糊查询）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['0', '1']
 *         description: 状态（0正常 1停用）
 *       - in: query
 *         name: phonenumber
 *         schema:
 *           type: string
 *         description: 手机号
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TableResponse'
 */
router.get('/list', authMiddleware, paginationMiddleware, userController.list);

/**
 * @swagger
 * /dev-api/system/user/{userId}:
 *   get:
 *     tags: [用户管理]
 *     summary: 用户详情
 *     description: 根据用户ID获取用户详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:userId', authMiddleware, userController.getInfo);

/**
 * @swagger
 * /dev-api/system/user:
 *   post:
 *     tags: [用户管理]
 *     summary: 新增用户
 *     description: 新增用户信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, nickName, password]
 *             properties:
 *               userName:
 *                 type: string
 *                 example: testuser
 *               nickName:
 *                 type: string
 *                 example: 测试用户
 *               password:
 *                 type: string
 *                 example: test123
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               phonenumber:
 *                 type: string
 *                 example: 13800138000
 *               sex:
 *                 type: string
 *                 enum: ['0', '1', '2']
 *               status:
 *                 type: string
 *                 enum: ['0', '1']
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               postIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: 新增成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', authMiddleware, userController.add);

/**
 * @swagger
 * /dev-api/system/user:
 *   put:
 *     tags: [用户管理]
 *     summary: 修改用户
 *     description: 修改用户信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *               nickName:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: ['0', '1', '2']
 *               status:
 *                 type: string
 *                 enum: ['0', '1']
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               postIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/', authMiddleware, userController.update);

/**
 * @swagger
 * /dev-api/system/user/{userIds}:
 *   delete:
 *     tags: [用户管理]
 *     summary: 删除用户
 *     description: 批量删除用户
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userIds
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID（多个用逗号分隔）
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:userIds', authMiddleware, userController.remove);

/**
 * @swagger
 * /dev-api/system/user/resetPwd:
 *   put:
 *     tags: [用户管理]
 *     summary: 重置密码
 *     description: 重置用户密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, password]
 *             properties:
 *               userId:
 *                 type: integer
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: 重置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/resetPwd', authMiddleware, userController.resetPassword);

module.exports = router;