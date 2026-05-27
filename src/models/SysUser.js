const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysUser = sequelize.define('SysUser', {
  userId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'user_id' },
  deptId: { type: DataTypes.BIGINT, field: 'dept_id' },
  userName: { type: DataTypes.STRING(30), allowNull: false, field: 'user_name' },
  nickName: { type: DataTypes.STRING(30), allowNull: false, field: 'nick_name' },
  email: { type: DataTypes.STRING(50), defaultValue: '', field: 'email' },
  phonenumber: { type: DataTypes.STRING(11), defaultValue: '', field: 'phonenumber' },
  sex: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'sex' },
  avatar: { type: DataTypes.STRING(100), defaultValue: '', field: 'avatar' },
  password: { type: DataTypes.STRING(100), defaultValue: '', field: 'password' },
  status: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'status' },
  delFlag: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'del_flag' },
  loginIp: { type: DataTypes.STRING(128), defaultValue: '', field: 'login_ip' },
  loginDate: { type: DataTypes.DATE, field: 'login_date' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
  remark: { type: DataTypes.STRING(500), defaultValue: '', field: 'remark' },
}, {
  tableName: 'sys_user',
  timestamps: false,
});

module.exports = SysUser;
