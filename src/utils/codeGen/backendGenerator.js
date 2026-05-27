const { toCamelCase, toPascalCase, extractColumnSize, columnTypeToSequelizeType } = require('./dbReader');

const generateModelCode = (table, columns) => {
  const className = toPascalCase(table.tableName.replace(/_/g, '_'));
  const fields = columns.map(col => {
    const camelField = toCamelCase(col.column_name);
    const seqType = columnTypeToSequelizeType(col.column_type);
    const size = extractColumnSize(col.column_type);
    const isPk = col.column_key === 'PRI';
    const isAutoIncrement = col.extra === 'auto_increment';
    const isRequired = col.is_nullable === 'NO' && !col.column_default && !isPk;
    const hasDefault = col.column_default !== null && col.column_default !== undefined;

    let typeStr = `DataTypes.${seqType}`;
    if (seqType === 'STRING' && size) {
      typeStr = `DataTypes.STRING(${size})`;
    }

    const attrs = [];
    if (isPk) attrs.push('primaryKey: true');
    if (isAutoIncrement) attrs.push('autoIncrement: true');
    attrs.push(`field: '${col.column_name}'`);
    if (isRequired) attrs.push('allowNull: false');
    if (hasDefault && !isPk) {
      const defaultVal = col.column_default;
      if (defaultVal === 'CURRENT_TIMESTAMP') {
        attrs.push(`defaultValue: DataTypes.NOW`);
      } else if (defaultVal === 'NULL') {
      } else if (defaultVal === "''") {
        attrs.push(`defaultValue: ''`);
      } else if (!isNaN(defaultVal)) {
        attrs.push(`defaultValue: ${defaultVal}`);
      } else {
        attrs.push(`defaultValue: '${defaultVal}'`);
      }
    }

    return `  ${camelField}: { type: ${typeStr}, ${attrs.join(', ')} }`;
  });

  return `const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ${className} = sequelize.define('${className}', {
${fields.join(',\n')}
}, {
  tableName: '${table.tableName}',
  timestamps: false,
});

module.exports = ${className};
`;
};

const generateControllerCode = (table, columns) => {
  const className = toPascalCase(table.tableName.replace(/_/g, '_'));
  const pkColumn = columns.find(c => c.column_key === 'PRI');
  const pkField = pkColumn ? toCamelCase(pkColumn.column_name) : 'id';
  const pkDbField = pkColumn ? pkColumn.column_name : 'id';
  const tableComment = table.tableComment || table.tableName;
  const queryColumns = columns.filter(c =>
    c.column_name !== 'create_time' &&
    c.column_name !== 'update_time' &&
    c.column_name !== 'create_by' &&
    c.column_name !== 'update_by' &&
    c.column_name !== 'del_flag' &&
    c.column_key !== 'PRI'
  );

  const whereConditions = queryColumns.slice(0, 4).map(col => {
    const field = toCamelCase(col.column_name);
    const type = col.column_type.toLowerCase();
    if (type.includes('varchar') || type.includes('char') || type.includes('text')) {
      return `    if (${field}) where.${col.column_name} = { [Op.like]: \`%\${${field}}%\` };`;
    }
    return `    if (${field}) where.${col.column_name} = ${field};`;
  });

  const queryParams = queryColumns.slice(0, 4).map(col => toCamelCase(col.column_name));
  const hasDelFlag = columns.some(c => c.column_name === 'del_flag');
  const hasStatus = columns.some(c => c.column_name === 'status');

  const createFields = columns
    .filter(c => c.column_key !== 'PRI' && c.extra !== 'auto_increment' && c.column_name !== 'create_time' && c.column_name !== 'update_time')
    .map(col => {
      const camel = toCamelCase(col.column_name);
      if (col.column_name === 'create_by') return `      ${col.column_name}: req.user.userName`;
      if (col.column_name === 'del_flag') return `      ${col.column_name}: '0'`;
      return `      ${col.column_name}: ${camel} || ''`;
    });

  const updateFields = columns
    .filter(c => c.column_key !== 'PRI' && c.extra !== 'auto_increment' && c.column_name !== 'create_time' && c.column_name !== 'update_time' && c.column_name !== 'create_by')
    .map(col => {
      const camel = toCamelCase(col.column_name);
      if (col.column_name === 'update_by') return `      ${col.column_name}: req.user.userName`;
      return `      ${col.column_name}: ${camel} || ''`;
    });

  return `const { ${className}, ${hasDelFlag ? '' : ''}} = require('../models');
const { AjaxResult, TableDataInfo } = require('../utils/response');
const { Op } = require('sequelize');

const list = async (req, res) => {
  try {
    const { pageNum, pageSize, offset } = req.pagination;
    const { ${queryParams.join(', ')} } = req.query;

    const where = {${hasDelFlag ? "\n      del_flag: '0'," : ''}
${whereConditions.join('\n')}
    };

    const { count, rows } = await ${className}.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['${pkDbField}', 'ASC']],
    });

    const tableData = new TableDataInfo(rows, count, pageNum, pageSize);
    res.json(tableData);
  } catch (error) {
    console.error('${tableComment}列表查询失败:', error);
    res.json(AjaxResult.error('查询${tableComment}列表失败'));
  }
};

const getInfo = async (req, res) => {
  try {
    const { ${pkField} } = req.params;
    const record = await ${className}.findByPk(${pkField});

    if (!record) {
      return res.json(AjaxResult.error('${tableComment}不存在'));
    }

    res.json({
      code: 200,
      msg: '操作成功',
      data: record,
    });
  } catch (error) {
    console.error('获取${tableComment}详情失败:', error);
    res.json(AjaxResult.error('获取${tableComment}详情失败'));
  }
};

const add = async (req, res) => {
  try {
    const { ${columns.filter(c => c.column_key !== 'PRI' && c.extra !== 'auto_increment' && c.column_name !== 'create_time' && c.column_name !== 'update_time').map(c => toCamelCase(c.column_name)).join(', ')} } = req.body;

    await ${className}.create({
${createFields.join(',\n')}
    });

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('新增${tableComment}失败:', error);
    res.json(AjaxResult.error('新增${tableComment}失败'));
  }
};

const update = async (req, res) => {
  try {
    const { ${pkField}, ${columns.filter(c => c.column_key !== 'PRI' && c.extra !== 'auto_increment' && c.column_name !== 'create_time' && c.column_name !== 'update_time' && c.column_name !== 'create_by').map(c => toCamelCase(c.column_name)).join(', ')} } = req.body;

    const record = await ${className}.findByPk(${pkField});
    if (!record) {
      return res.json(AjaxResult.error('${tableComment}不存在'));
    }

    await record.update({
${updateFields.join(',\n')}
    });

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('修改${tableComment}失败:', error);
    res.json(AjaxResult.error('修改${tableComment}失败'));
  }
};

const remove = async (req, res) => {
  try {
    const { ${pkField}s } = req.params;
    const ids = ${pkField}s.split(',').map(Number);

${hasDelFlag
      ? `    await ${className}.update(
      { del_flag: '2', update_by: req.user.userName },
      { where: { ${pkDbField}: { [Op.in]: ids } } }
    );`
      : `    await ${className}.destroy(
      { where: { ${pkDbField}: { [Op.in]: ids } } }
    );`
    }

    res.json(AjaxResult.success());
  } catch (error) {
    console.error('删除${tableComment}失败:', error);
    res.json(AjaxResult.error('删除${tableComment}失败'));
  }
};

module.exports = { list, getInfo, add, update, remove };
`;
};

const generateRouteCode = (table, businessName) => {
  const tableComment = table.tableComment || table.tableName;
  const moduleName = table.moduleName || 'system';
  const controllerName = `${businessName}Controller`;

  return `const express = require('express');
const router = express.Router();
const ${controllerName} = require('../controllers/${controllerName}');
const authMiddleware = require('../middlewares/auth');
const paginationMiddleware = require('../middlewares/pagination');

router.get('/list', authMiddleware, paginationMiddleware, ${controllerName}.list);
router.get('/:${businessName}Id', authMiddleware, ${controllerName}.getInfo);
router.post('/', authMiddleware, ${controllerName}.add);
router.put('/', authMiddleware, ${controllerName}.update);
router.delete('/:${businessName}Ids', authMiddleware, ${controllerName}.remove);

module.exports = router;
`;
};

module.exports = {
  generateModelCode,
  generateControllerCode,
  generateRouteCode,
};
