const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysDept = sequelize.define('SysDept', {
  deptId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'dept_id' },
  parentId: { type: DataTypes.BIGINT, defaultValue: 0, field: 'parent_id' },
  ancestors: { type: DataTypes.STRING(500), defaultValue: '', field: 'ancestors' },
  deptName: { type: DataTypes.STRING(30), defaultValue: '', field: 'dept_name' },
  orderNum: { type: DataTypes.INTEGER, defaultValue: 0, field: 'order_num' },
  leader: { type: DataTypes.STRING(20), defaultValue: '', field: 'leader' },
  phone: { type: DataTypes.STRING(11), defaultValue: '', field: 'phone' },
  email: { type: DataTypes.STRING(50), defaultValue: '', field: 'email' },
  status: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'status' },
  delFlag: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'del_flag' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
}, {
  tableName: 'sys_dept',
  timestamps: false,
});

module.exports = SysDept;
