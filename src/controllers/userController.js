const bcrypt = require('bcryptjs');
const { SysUser, SysRole, SysPost, SysDept, SysUserRole, SysUserPost } = require('../models');
const { AjaxResult, TableDataInfo } = require('../utils/response');
const { Op } = require('sequelize');

const list = async (req, res) => {
  try {
    const { pageNum, pageSize, offset } = req.pagination;
    const { userName, phonenumber, status, deptId } = req.query;

    const where = { del_flag: '0' };
    if (userName) where.user_name = { [Op.like]: `%${userName}%` };
    if (phonenumber) where.phonenumber = { [Op.like]: `%${phonenumber}%` };
    if (status) where.status = status;
    if (deptId) where.dept_id = deptId;

    const { count, rows } = await SysUser.findAndCountAll({
      where,
      include: [
        { model: SysDept, as: 'dept', attributes: ['deptId', 'deptName'] },
        { model: SysRole, as: 'roles', attributes: ['roleId', 'roleName', 'roleKey'], through: { attributes: [] } },
        { model: SysPost, as: 'posts', attributes: ['postId', 'postName'], through: { attributes: [] } },
      ],
      attributes: { exclude: ['password'] },
      limit: pageSize,
      offset,
      order: [['user_id', 'ASC']],
      distinct: true,
    });

    const tableData = new TableDataInfo(rows, count, pageNum, pageSize);
    res.json(tableData);
  } catch (error) {
    console.error('User list error:', error);
    res.json(AjaxResult.error('查询用户列表失败'));
  }
};

const getInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await SysUser.findByPk(userId, {
      include: [
        { model: SysRole, as: 'roles', attributes: ['roleId', 'roleName', 'roleKey'], through: { attributes: [] } },
        { model: SysPost, as: 'posts', attributes: ['postId', 'postName'], through: { attributes: [] } },
        { model: SysDept, as: 'dept', attributes: ['deptId', 'deptName'] },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.json(AjaxResult.error('用户不存在'));
    }

    res.json({
      code: 200,
      msg: '操作成功',
      data: user,
      roles: user.roles,
      posts: user.posts,
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.json(AjaxResult.error('获取用户信息失败'));
  }
};

const add = async (req, res) => {
  try {
    const { userName, nickName, password, email, phonenumber, sex, status, deptId, roleIds, postIds, remark } = req.body;

    const existUser = await SysUser.findOne({ where: { user_name: userName } });
    if (existUser) {
      return res.json(AjaxResult.error('用户名已存在'));
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const user = await SysUser.create({
      user_name: userName,
      nick_name: nickName,
      password: hashedPassword,
      email: email || '',
      phonenumber: phonenumber || '',
      sex: sex || '0',
      status: status || '0',
      dept_id: deptId,
      create_by: req.user.userName,
      remark: remark || '',
    });

    if (roleIds && roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({ user_id: user.userId, role_id: roleId }));
      await SysUserRole.bulkCreate(userRoles);
    }

    if (postIds && postIds.length > 0) {
      const userPosts = postIds.map(postId => ({ user_id: user.userId, post_id: postId }));
      await SysUserPost.bulkCreate(userPosts);
    }

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('Add user error:', error);
    res.json(AjaxResult.error('新增用户失败'));
  }
};

const update = async (req, res) => {
  try {
    const { userId, nickName, email, phonenumber, sex, status, deptId, roleIds, postIds, remark } = req.body;

    const user = await SysUser.findByPk(userId);
    if (!user) {
      return res.json(AjaxResult.error('用户不存在'));
    }

    await user.update({
      nick_name: nickName,
      email: email || '',
      phonenumber: phonenumber || '',
      sex: sex || '0',
      status: status || '0',
      dept_id: deptId,
      update_by: req.user.userName,
      remark: remark || '',
    });

    if (roleIds) {
      await SysUserRole.destroy({ where: { user_id: userId } });
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({ user_id: userId, role_id: roleId }));
        await SysUserRole.bulkCreate(userRoles);
      }
    }

    if (postIds) {
      await SysUserPost.destroy({ where: { user_id: userId } });
      if (postIds.length > 0) {
        const userPosts = postIds.map(postId => ({ user_id: userId, post_id: postId }));
        await SysUserPost.bulkCreate(userPosts);
      }
    }

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('Update user error:', error);
    res.json(AjaxResult.error('修改用户失败'));
  }
};

const remove = async (req, res) => {
  try {
    const { userIds } = req.params;
    const ids = userIds.split(',').map(Number);

    await SysUser.update(
      { del_flag: '2', update_by: req.user.userName },
      { where: { user_id: { [Op.in]: ids } } }
    );

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('Delete user error:', error);
    res.json(AjaxResult.error('删除用户失败'));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    await SysUser.update(
      { password: hashedPassword, update_by: req.user.userName },
      { where: { user_id: userId } }
    );

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('Reset password error:', error);
    res.json(AjaxResult.error('重置密码失败'));
  }
};

module.exports = { list, getInfo, add, update, remove, resetPassword };