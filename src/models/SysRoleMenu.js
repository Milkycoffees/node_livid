const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysRoleMenu = sequelize.define('SysRoleMenu', {
  roleId: { type: DataTypes.BIGINT, primaryKey: true, field: 'role_id' },
  menuId: { type: DataTypes.BIGINT, primaryKey: true, field: 'menu_id' },
}, {
  tableName: 'sys_role_menu',
  timestamps: false,
});

module.exports = SysRoleMenu;
