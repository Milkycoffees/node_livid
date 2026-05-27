const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysUserPost = sequelize.define('SysUserPost', {
  userId: { type: DataTypes.BIGINT, primaryKey: true, field: 'user_id' },
  postId: { type: DataTypes.BIGINT, primaryKey: true, field: 'post_id' },
}, {
  tableName: 'sys_user_post',
  timestamps: false,
});

module.exports = SysUserPost;
