const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /dev-api/captchaImage:
 *   get:
 *     tags: [认证]
 *     summary: 获取验证码
 *     description: 生成图片验证码
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: 操作成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     captchaEnabled:
 *                       type: boolean
 *                       example: true
 *                     img:
 *                       type: string
 *                       description: Base64 编码的验证码图片
 *                     uuid:
 *                       type: string
 *                       description: 验证码唯一标识
 */
router.get('/captchaImage', authController.getCaptcha);

/**
 * @swagger
 * /dev-api/login:
 *   post:
 *     tags: [认证]
 *     summary: 用户登录
 *     description: 用户名密码登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, code, uuid]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *               code:
 *                 type: string
 *                 example: 1234
 *               uuid:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: 操作成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT Token
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /dev-api/getInfo:
 *   get:
 *     tags: [认证]
 *     summary: 获取用户信息
 *     description: 获取当前登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: 操作成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/getInfo', authMiddleware, authController.getInfo);

/**
 * @swagger
 * /dev-api/getRouters:
 *   get:
 *     tags: [认证]
 *     summary: 获取路由菜单
 *     description: 获取当前用户的菜单路由
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: 操作成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/getRouters', authMiddleware, authController.getRouters);

module.exports = router;
