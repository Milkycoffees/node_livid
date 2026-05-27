const bcrypt = require('bcryptjs');
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');
const { SysUser, SysRole, SysMenu } = require('../models');
const { generateToken } = require('../utils/jwt');
const { AjaxResult } = require('../utils/response');
const redis = require('../config/redis');

const captchaStore = new Map();

const getCaptcha = async (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1i',
      noise: 2,
      color: true,
    });
    
    const uuid = crypto.randomUUID();
    captchaStore.set(uuid, captcha.text.toLowerCase());
    
    setTimeout(() => captchaStore.delete(uuid), 5 * 60 * 1000);
    
    res.json({
      msg: '操作成功',
      img: Buffer.from(captcha.data).toString('base64'),
      uuid,
      captchaEnabled: true,
    });
  } catch (error) {
    res.json(AjaxResult.error('获取验证码失败'));
  }
};

const login = async (req, res) => {
  try {
    const { username, password, code, uuid } = req.body;
    
    if (!username || !password) {
      return res.json(AjaxResult.error('用户名和密码不能为空'));
    }

    const captchaCode = captchaStore.get(uuid);
    if (captchaCode && code && captchaCode !== code.toLowerCase()) {
      captchaStore.delete(uuid);
      return res.json(AjaxResult.error('验证码错误'));
    }
    captchaStore.delete(uuid);

    const user = await SysUser.findOne({
      where: { user_name: username, del_flag: '0' },
      include: [{ model: SysRole, as: 'roles' }],
    });

    if (!user) {
      return res.json(AjaxResult.error('用户不存在'));
    }

    if (user.status !== '0') {
      return res.json(AjaxResult.error('用户已被停用'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json(AjaxResult.error('密码错误'));
    }

    const token = generateToken({
      userId: user.userId,
      userName: user.userName,
      deptId: user.deptId,
    });

    await user.update({
      login_ip: req.ip,
      login_date: new Date(),
    });

    res.json({
      code: 200,
      msg: '操作成功',
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json(AjaxResult.error('登录失败'));
  }
};

const getInfo = async (req, res) => {
  try {
    const user = await SysUser.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: SysRole, as: 'roles', where: { status: '0' }, required: false },
      ],
    });

    if (!user) {
      return res.json(AjaxResult.error('用户不存在'));
    }

    const roles = user.roles.map(role => role.roleKey);
    const permissions = roles.includes('admin') ? ['*:*:*'] : [];

    res.json({
      code: 200,
      msg: '操作成功',
      user: {
        userId: user.userId,
        userName: user.userName,
        nickName: user.nickName,
        email: user.email,
        phonenumber: user.phonenumber,
        sex: user.sex,
        avatar: user.avatar,
        deptId: user.deptId,
      },
      roles,
      permissions,
    });
  } catch (error) {
    console.error('GetInfo error:', error);
    res.json(AjaxResult.error('获取用户信息失败'));
  }
};

const getRouters = async (req, res) => {
  try {
    const user = await SysUser.findByPk(req.user.userId, {
      include: [{ model: SysRole, as: 'roles' }],
    });

    const isAdmin = user.roles.some(role => role.roleKey === 'admin');
    
    let menus;
    if (isAdmin) {
      menus = await SysMenu.findAll({
        where: { status: '0', visible: '0' },
        order: [['order_num', 'ASC']],
      });
    } else {
      const roleIds = user.roles.map(r => r.roleId);
      menus = await SysMenu.findAll({
        include: [{
          model: SysRole,
          as: 'roles',
          where: { role_id: roleIds },
          required: true,
        }],
        where: { status: '0', visible: '0' },
        order: [['order_num', 'ASC']],
      });
    }

    const buildTree = (list, parentId = 0) => {
      return list
        .filter(item => item.parentId === parentId)
        .map(item => ({
          name: item.menuName,
          path: item.path,
          hidden: item.visible !== '0',
          redirect: item.menuType === 'M' ? 'noRedirect' : undefined,
          component: item.component || 'Layout',
          alwaysShow: item.menuType === 'M',
          meta: {
            title: item.menuName,
            icon: item.icon,
            noCache: item.isCache !== 0,
            link: null,
          },
          children: buildTree(list, item.menuId),
        }))
        .filter(item => item.children.length > 0 || item.component !== 'Layout');
    };

    const routers = buildTree(menus);

    res.json({
      code: 200,
      msg: '操作成功',
      data: routers,
    });
  } catch (error) {
    console.error('GetRouters error:', error);
    res.json(AjaxResult.error('获取路由信息失败'));
  }
};

module.exports = { getCaptcha, login, getInfo, getRouters };
