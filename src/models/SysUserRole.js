const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysUserRole = sequelize.define('SysUserRole', {
  userId: { type: DataTypes.BIGINT, primaryKey: true, field: 'user_id' },
  roleId: { type: DataTypes.BIGINT, primaryKey: true, field: 'role_id' },
}, {
  tableName: 'sys_user_role',
  timestamps: false,
});

module.exports = SysUserRole;
