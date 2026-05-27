const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GenTable = sequelize.define('GenTable', {
  tableId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'table_id' },
  tableName: { type: DataTypes.STRING(200), defaultValue: '', field: 'table_name' },
  tableComment: { type: DataTypes.STRING(500), defaultValue: '', field: 'table_comment' },
  subTableName: { type: DataTypes.STRING(64), defaultValue: '', field: 'sub_table_name' },
  subTableFkName: { type: DataTypes.STRING(64), defaultValue: '', field: 'sub_table_fk_name' },
  className: { type: DataTypes.STRING(100), defaultValue: '', field: 'class_name' },
  tplCategory: { type: DataTypes.STRING(200), defaultValue: 'crud', field: 'tpl_category' },
  tplWebType: { type: DataTypes.STRING(30), defaultValue: 'vue3', field: 'tpl_web_type' },
  packageName: { type: DataTypes.STRING(100), defaultValue: '', field: 'package_name' },
  moduleName: { type: DataTypes.STRING(30), defaultValue: '', field: 'module_name' },
  businessName: { type: DataTypes.STRING(30), defaultValue: '', field: 'business_name' },
  functionName: { type: DataTypes.STRING(50), defaultValue: '', field: 'function_name' },
  functionAuthor: { type: DataTypes.STRING(50), defaultValue: '', field: 'function_author' },
  genType: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'gen_type' },
  genPath: { type: DataTypes.STRING(200), defaultValue: '/', field: 'gen_path' },
  options: { type: DataTypes.STRING(1000), defaultValue: '', field: 'options' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
  remark: { type: DataTypes.STRING(500), defaultValue: '', field: 'remark' },
}, {
  tableName: 'gen_table',
  timestamps: false,
});

module.exports = GenTable;
