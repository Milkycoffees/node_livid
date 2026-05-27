const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GenTableColumn = sequelize.define('GenTableColumn', {
  columnId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'column_id' },
  tableId: { type: DataTypes.BIGINT, field: 'table_id' },
  columnName: { type: DataTypes.STRING(200), defaultValue: '', field: 'column_name' },
  columnComment: { type: DataTypes.STRING(500), defaultValue: '', field: 'column_comment' },
  columnType: { type: DataTypes.STRING(100), defaultValue: '', field: 'column_type' },
  javaType: { type: DataTypes.STRING(50), defaultValue: '', field: 'java_type' },
  javaField: { type: DataTypes.STRING(200), defaultValue: '', field: 'java_field' },
  isPk: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_pk' },
  isIncrement: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_increment' },
  isRequired: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_required' },
  isInsert: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_insert' },
  isEdit: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_edit' },
  isList: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_list' },
  isQuery: { type: DataTypes.CHAR(1), defaultValue: '0', field: 'is_query' },
  queryType: { type: DataTypes.STRING(200), defaultValue: 'EQ', field: 'query_type' },
  htmlType: { type: DataTypes.STRING(200), defaultValue: '', field: 'html_type' },
  dictType: { type: DataTypes.STRING(200), defaultValue: '', field: 'dict_type' },
  sort: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort' },
  createBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'create_by' },
  createTime: { type: DataTypes.DATE, field: 'create_time' },
  updateBy: { type: DataTypes.STRING(64), defaultValue: '', field: 'update_by' },
  updateTime: { type: DataTypes.DATE, field: 'update_time' },
}, {
  tableName: 'gen_table_column',
  timestamps: false,
});

module.exports = GenTableColumn;
