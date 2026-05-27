const SysUser = require('./SysUser');
const SysRole = require('./SysRole');
const SysMenu = require('./SysMenu');
const SysDept = require('./SysDept');
const SysPost = require('./SysPost');
const SysUserRole = require('./SysUserRole');
const SysRoleMenu = require('./SysRoleMenu');
const SysUserPost = require('./SysUserPost');
const GenTable = require('./GenTable');
const GenTableColumn = require('./GenTableColumn');
const SysAuditLog = require('./SysAuditLog');

SysUser.belongsToMany(SysRole, { through: SysUserRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' });
SysRole.belongsToMany(SysUser, { through: SysUserRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' });

SysRole.belongsToMany(SysMenu, { through: SysRoleMenu, foreignKey: 'role_id', otherKey: 'menu_id', as: 'menus' });
SysMenu.belongsToMany(SysRole, { through: SysRoleMenu, foreignKey: 'menu_id', otherKey: 'role_id', as: 'roles' });

SysUser.belongsToMany(SysPost, { through: SysUserPost, foreignKey: 'user_id', otherKey: 'post_id', as: 'posts' });
SysPost.belongsToMany(SysUser, { through: SysUserPost, foreignKey: 'post_id', otherKey: 'user_id', as: 'users' });

SysUser.belongsTo(SysDept, { foreignKey: 'dept_id', as: 'dept' });
SysDept.hasMany(SysUser, { foreignKey: 'dept_id', as: 'users' });

SysMenu.hasMany(SysMenu, { foreignKey: 'parent_id', as: 'children' });
SysMenu.belongsTo(SysMenu, { foreignKey: 'parent_id', as: 'parent' });

SysDept.hasMany(SysDept, { foreignKey: 'parent_id', as: 'children' });
SysDept.belongsTo(SysDept, { foreignKey: 'parent_id', as: 'parent' });

GenTable.hasMany(GenTableColumn, { foreignKey: 'table_id', as: 'columns' });
GenTableColumn.belongsTo(GenTable, { foreignKey: 'table_id', as: 'table' });

module.exports = {
  SysUser,
  SysRole,
  SysMenu,
  SysDept,
  SysPost,
  SysUserRole,
  SysRoleMenu,
  SysUserPost,
  GenTable,
  GenTableColumn,
  SysAuditLog,
};
