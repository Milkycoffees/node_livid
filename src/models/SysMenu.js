const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SysMenu = sequelize.define('SysMenu', {
  menuId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'menu_id' },
  menuName: { type: DataTypes.STRING(50), allowNull: false, field: 'menu_name' },
  parentId: { type: DataTypes.BIGINT, defaultValue: 0, field: 'parent_id' },
  orderNum: { type: DataTypes.INTEGER, defaultValue: 0, field: 'order_num' },
  path: { type: DataTypes.STRING(200), defaultValue: '', field: 'path' },
  component: { type: DataTypes.STRING(255), defaultValue: '', field: 'component' },
  query: { type: DataTypes.STRING(255), defaultValue: '', field: 'query' },
  isFrame: { type: DataTypes.INTEGER, defaultValue: 1, field: 'is_frame' },
  isCache: { type: DataTypes.INTEGER, defaultValue: 0, field: 'is_cache' },
  menuType: { type: DataTypes.CHAR(1), defaultValue: '', field: 'menu_type' },
  visible: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'visible' },
  status: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'status' },
  perms: { type: DataTypes.STRING(100), defaultValue: '', field: 'perms' },
  icon: { type: DataTypes.STRING(100), defaultValue: '#', field: 'icon' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
  remark: { type: DataTypes.STRING(500), defaultValue: '', field: 'remark' },
}, {
  tableName: 'sys_menu',
  timestamps: false,
});

module.exports = SysMenu;
