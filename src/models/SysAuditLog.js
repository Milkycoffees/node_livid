const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysAuditLog = sequelize.define('SysAuditLog', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'id' },
  op: { type: DataTypes.STRING(20), allowNull: false, field: 'op', comment: '操作类型' },
  target: { type: DataTypes.STRING(50), allowNull: false, field: 'target', comment: '操作对象' },
  targetId: { type: DataTypes.STRING(255), allowNull: false, field: 'target_id', comment: '操作对象ID' },
  args: { type: DataTypes.JSON, allowNull: true, field: 'args', comment: '操作参数' },
  userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id', comment: '操作人ID' },
  userName: { type: DataTypes.STRING(30), allowNull: false, field: 'user_name', comment: '操作人用户名' },
  ip: { type: DataTypes.STRING(128), allowNull: false, field: 'ip', comment: '操作IP' },
  result: { type: DataTypes.STRING(10), allowNull: false, field: 'result', comment: '操作结果' },
  error: { type: DataTypes.TEXT, allowNull: true, field: 'error', comment: '错误信息' },
  ts: { type: DataTypes.DATE, allowNull: false, field: 'ts', comment: '操作时间戳' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
}, {
  tableName: 'pro_add_log',
  timestamps: false,
  indexes: [
    {
      name: 'idx_pro_add_log_op',
      fields: ['op']
    },
    {
      name: 'idx_pro_add_log_target',
      fields: ['target']
    },
    {
      name: 'idx_pro_add_log_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_pro_add_log_ts',
      fields: ['ts']
    },
    {
      name: 'idx_pro_add_log_result',
      fields: ['result']
    }
  ]
});

module.exports = SysAuditLog;
