const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { SysUser, SysRole, SysMenu, SysDept, SysPost, SysUserRole, SysRoleMenu, SysUserPost } = require('../models');

const seed = async () => {
  try {
    console.log('开始插入种子数据...');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    await SysDept.bulkCreate([
      { deptId: 100, parentId: 0, ancestors: '0', deptName: 'Livid科技', orderNum: 0, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 101, parentId: 100, ancestors: '0,100', deptName: '深圳总公司', orderNum: 1, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 102, parentId: 100, ancestors: '0,100', deptName: '长沙分公司', orderNum: 2, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 103, parentId: 101, ancestors: '0,100,101', deptName: '研发部门', orderNum: 1, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 104, parentId: 101, ancestors: '0,100,101', deptName: '市场部门', orderNum: 2, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 105, parentId: 101, ancestors: '0,100,101', deptName: '测试部门', orderNum: 3, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 106, parentId: 101, ancestors: '0,100,101', deptName: '财务部门', orderNum: 4, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 107, parentId: 101, ancestors: '0,100,101', deptName: '运维部门', orderNum: 5, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 108, parentId: 102, ancestors: '0,100,102', deptName: '市场部门', orderNum: 1, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
      { deptId: 109, parentId: 102, ancestors: '0,100,102', deptName: '财务部门', orderNum: 2, leader: 'Livid', phone: '15888888888', email: 'ry@qq.com', status: '0', delFlag: '0' },
    ]);
    console.log('部门数据插入成功');

    await SysRole.bulkCreate([
      { roleId: 1, roleName: '超级管理员', roleKey: 'admin', roleSort: 1, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0' },
      { roleId: 2, roleName: '普通角色', roleKey: 'common', roleSort: 2, dataScope: '2', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0' },
    ]);
    console.log('角色数据插入成功');

    await SysMenu.bulkCreate([
      { menuId: 1, menuName: '系统管理', parentId: 0, orderNum: 1, path: 'system', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'M', visible: '0', status: '0', perms: '', icon: 'system' },
      { menuId: 2, menuName: '系统监控', parentId: 0, orderNum: 2, path: 'monitor', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'M', visible: '0', status: '0', perms: '', icon: 'monitor' },
      { menuId: 3, menuName: '系统工具', parentId: 0, orderNum: 3, path: 'tool', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'M', visible: '0', status: '0', perms: '', icon: 'tool' },
      { menuId: 109, menuName: '代码生成', parentId: 3, orderNum: 1, path: 'gen', component: 'tool/gen/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'tool:gen:list', icon: 'code' },
      { menuId: 100, menuName: '用户管理', parentId: 1, orderNum: 1, path: 'user', component: 'system/user/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:user:list', icon: 'user' },
      { menuId: 101, menuName: '角色管理', parentId: 1, orderNum: 2, path: 'role', component: 'system/role/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:role:list', icon: 'peoples' },
      { menuId: 102, menuName: '菜单管理', parentId: 1, orderNum: 3, path: 'menu', component: 'system/menu/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:menu:list', icon: 'tree-table' },
      { menuId: 103, menuName: '部门管理', parentId: 1, orderNum: 4, path: 'dept', component: 'system/dept/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:dept:list', icon: 'tree' },
      { menuId: 104, menuName: '岗位管理', parentId: 1, orderNum: 5, path: 'post', component: 'system/post/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:post:list', icon: 'post' },
      { menuId: 105, menuName: '字典管理', parentId: 1, orderNum: 6, path: 'dict', component: 'system/dict/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:dict:list', icon: 'dict' },
      { menuId: 106, menuName: '参数设置', parentId: 1, orderNum: 7, path: 'config', component: 'system/config/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:config:list', icon: 'edit' },
      { menuId: 107, menuName: '通知公告', parentId: 1, orderNum: 8, path: 'notice', component: 'system/notice/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'system:notice:list', icon: 'message' },
      { menuId: 108, menuName: '日志管理', parentId: 1, orderNum: 9, path: 'log', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'M', visible: '0', status: '0', perms: '', icon: 'log' },
      { menuId: 500, menuName: '操作日志', parentId: 108, orderNum: 1, path: 'operlog', component: 'monitor/operlog/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'monitor:operlog:list', icon: 'form' },
      { menuId: 501, menuName: '登录日志', parentId: 108, orderNum: 2, path: 'logininfor', component: 'monitor/logininfor/index', query: '', isFrame: 1, isCache: 0, menuType: 'C', visible: '0', status: '0', perms: 'monitor:logininfor:list', icon: 'logininfor' },
      { menuId: 1000, menuName: '用户查询', parentId: 100, orderNum: 1, path: '', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'F', visible: '0', status: '0', perms: 'system:user:query', icon: '#' },
      { menuId: 1001, menuName: '用户新增', parentId: 100, orderNum: 2, path: '', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'F', visible: '0', status: '0', perms: 'system:user:add', icon: '#' },
      { menuId: 1002, menuName: '用户修改', parentId: 100, orderNum: 3, path: '', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'F', visible: '0', status: '0', perms: 'system:user:edit', icon: '#' },
      { menuId: 1003, menuName: '用户删除', parentId: 100, orderNum: 4, path: '', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'F', visible: '0', status: '0', perms: 'system:user:remove', icon: '#' },
      { menuId: 1004, menuName: '重置密码', parentId: 100, orderNum: 5, path: '', component: '', query: '', isFrame: 1, isCache: 0, menuType: 'F', visible: '0', status: '0', perms: 'system:user:resetPwd', icon: '#' },
    ]);
    console.log('菜单数据插入成功');

    await SysPost.bulkCreate([
      { postId: 1, postCode: 'ceo', postName: '董事长', postSort: 1, status: '0' },
      { postId: 2, postCode: 'cto', postName: '技术总监', postSort: 2, status: '0' },
      { postId: 3, postCode: 'hr', postName: '人力资源', postSort: 3, status: '0' },
      { postId: 4, postCode: 'user', postName: '普通员工', postSort: 4, status: '0' },
    ]);
    console.log('岗位数据插入成功');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const ryPassword = await bcrypt.hash('123456', 10);
    await SysUser.bulkCreate([
      { userId: 1, deptId: 103, userName: 'admin', nickName: 'Livid', email: 'ry@163.com', phonenumber: '15888888888', sex: '0', password: adminPassword, status: '0', delFlag: '0' },
      { userId: 2, deptId: 105, userName: 'ry', nickName: 'Livid', email: 'ry@qq.com', phonenumber: '15666666666', sex: '0', password: ryPassword, status: '0', delFlag: '0' },
    ]);
    console.log('用户数据插入成功');

    await SysUserRole.bulkCreate([
      { userId: 1, roleId: 1 },
      { userId: 2, roleId: 2 },
    ]);
    console.log('用户角色关联数据插入成功');

    const adminMenuIds = [1, 2, 3, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 500, 501, 1000, 1001, 1002, 1003, 1004];
    const roleMenus = adminMenuIds.map(menuId => ({ roleId: 1, menuId }));
    await SysRoleMenu.bulkCreate(roleMenus);
    console.log('角色菜单关联数据插入成功');

    await SysUserPost.bulkCreate([
      { userId: 1, postId: 1 },
      { userId: 2, postId: 4 },
    ]);
    console.log('用户岗位关联数据插入成功');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('种子数据插入完成');
    process.exit(0);
  } catch (error) {
    console.error('种子数据插入失败:', error);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    process.exit(1);
  }
};

seed();
