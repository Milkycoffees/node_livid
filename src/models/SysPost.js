const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysPost = sequelize.define('SysPost', {
  postId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'post_id' },
  postCode: { type: DataTypes.STRING(64), allowNull: false, field: 'post_code' },
  postName: { type: DataTypes.STRING(50), allowNull: false, field: 'post_name' },
  postSort: { type: DataTypes.INTEGER, allowNull: false, field: 'post_sort' },
  status: { type: DataTypes.CHAR(1), allowNull: false, field: 'status' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
  remark: { type: DataTypes.STRING(500), defaultValue: '', field: 'remark' },
}, {
  tableName: 'sys_post',
  timestamps: false,
});

module.exports = SysPost;
