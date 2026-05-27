const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysRole = sequelize.define('SysRole', {
  roleId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'role_id' },
  roleName: { type: DataTypes.STRING(30), allowNull: false, field: 'role_name' },
  roleKey: { type: DataTypes.STRING(100), allowNull: false, field: 'role_key' },
  roleSort: { type: DataTypes.INTEGER, allowNull: false, field: 'role_sort' },
  dataScope: { type: DataTypes.CHAR(1), defaultValue: '1', field: 'data_scope' },
  menuCheckStrictly: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'menu_check_strictly' },
  deptCheckStrictly: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'dept_check_strictly' },
  status: { type: DataTypes.CHAR(1), allowNull: false, field: 'status' },
  delFlag: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'del_flag' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
  remark: { type: DataTypes.STRING(500), defaultValue: '', field: 'remark' },
}, {
  tableName: 'sys_role',
  timestamps: false,
});

module.exports = SysRole;
