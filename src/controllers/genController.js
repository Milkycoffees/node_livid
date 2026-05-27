const { GenTable, GenTableColumn } = require('../models');
const { AjaxResult, TableDataInfo } = require('../utils/response');
const { getDbTables, getDbTableColumns, toCamelCase, toPascalCase, processColumns } = require('../utils/codeGen/dbReader');
const { generateModelCode, generateControllerCode, generateRouteCode } = require('../utils/codeGen/backendGenerator');
const { generateApiCode, generateVueIndexCode } = require('../utils/codeGen/frontendGenerator');
const { Op } = require('sequelize');
const archiver = require('archiver');
const { createAuditLog } = require('../utils/auditLog');

const list = async (req, res) => {
  try {
    const { pageNum, pageSize, offset } = req.pagination;
    const { tableName, tableComment } = req.query;

    const where = {};
    if (tableName) where.table_name = { [Op.like]: `%${tableName}%` };
    if (tableComment) where.table_comment = { [Op.like]: `%${tableComment}%` };

    const { count, rows } = await GenTable.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['create_time', 'DESC']],
    });

    const tableData = new TableDataInfo(rows, count, pageNum, pageSize);
    res.json(tableData);
  } catch (error) {
    console.error('查询代码生成列表失败:', error);
    res.json(AjaxResult.error('查询代码生成列表失败'));
  }
};

const dbList = async (req, res) => {
  try {
    const { pageNum, pageSize } = req.pagination;
    const { tableName, tableComment } = req.query;

    const tables = await getDbTables();

    let filtered = tables;
    if (tableName) {
      filtered = filtered.filter(t => t.table_name.includes(tableName));
    }
    if (tableComment) {
      filtered = filtered.filter(t => (t.table_comment || '').includes(tableComment));
    }

    const total = filtered.length;
    const start = (pageNum - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);

    const tableData = new TableDataInfo(rows, total, pageNum, pageSize);
    res.json(tableData);
  } catch (error) {
    console.error('查询数据库表列表失败:', error);
    res.json(AjaxResult.error('查询数据库表列表失败'));
  }
};

const getInfo = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await GenTable.findByPk(tableId, {
      include: [{ model: GenTableColumn, as: 'columns' }],
    });

    if (!table) {
      return res.json(AjaxResult.error('表不存在'));
    }

    const columns = await GenTableColumn.findAll({
      where: { table_id: tableId },
      order: [['sort', 'ASC']],
    });

    res.json({
      code: 200,
      msg: '操作成功',
      data: table,
      rows: columns,
    });
  } catch (error) {
    console.error('获取表信息失败:', error);
    res.json(AjaxResult.error('获取表信息失败'));
  }
};

const importTable = async (req, res) => {
  const startTime = new Date().toISOString();
  const auditLog = {
    op: 'CREATE',
    target: 'gen_table',
    targetId: '',
    args: { tables: req.body.tables },
    userId: req.user.userId,
    userName: req.user.userName,
    ip: req.ip,
    result: 'SUCCESS',
    error: null,
    ts: startTime,
  };

  try {
    const { tables } = req.body;

    if (!tables || tables.length === 0) {
      auditLog.result = 'FAIL';
      auditLog.error = '请选择要导入的表';
      await createAuditLog(auditLog);
      return res.json(AjaxResult.error('请选择要导入的表'));
    }

    const tableNames = tables.split(',');
    const dbTables = await getDbTables(tableNames);

    const imported = [];

    for (const dbTable of dbTables) {
      const existing = await GenTable.findOne({ where: { table_name: dbTable.table_name } });
      if (existing) {
        continue;
      }

      const className = toPascalCase(dbTable.table_name);
      const tableNameParts = dbTable.table_name.split('_');
      const moduleName = tableNameParts[0] || 'system';
      const businessName = tableNameParts.slice(1).join('_') || dbTable.table_name;

      const genTable = await GenTable.create({
        table_name: dbTable.table_name,
        table_comment: dbTable.table_comment || dbTable.table_name,
        class_name: className,
        tpl_category: 'crud',
        tpl_web_type: 'vue3',
        package_name: '',
        module_name: moduleName,
        business_name: businessName,
        function_name: dbTable.table_comment || dbTable.table_name,
        function_author: 'node-livid',
        gen_type: '0',
        gen_path: '/',
        create_by: req.user.userName,
      });

      const dbColumns = await getDbTableColumns(dbTable.table_name);
      const processedColumns = processColumns(dbColumns);

      for (const col of processedColumns) {
        await GenTableColumn.create({
          table_id: genTable.tableId,
          ...col,
          create_by: req.user.userName,
        });
      }

      imported.push(dbTable.table_name);
    }

    auditLog.targetId = imported.join(',');
    await createAuditLog(auditLog);
    res.json(AjaxResult.success(null, `成功导入 ${imported.length} 张表`));
  } catch (error) {
    auditLog.result = 'FAIL';
    auditLog.error = error.message;
    await createAuditLog(auditLog);
    console.error('导入表失败:', error);
    res.json(AjaxResult.error('导入表失败'));
  }
};

const updateTable = async (req, res) => {
  const startTime = new Date().toISOString();
  const auditLog = {
    op: 'UPDATE',
    target: 'gen_table',
    targetId: req.body.tableId,
    args: { tableComment: req.body.tableComment, className: req.body.className, moduleName: req.body.moduleName, businessName: req.body.businessName },
    userId: req.user.userId,
    userName: req.user.userName,
    ip: req.ip,
    result: 'SUCCESS',
    error: null,
    ts: startTime,
  };

  try {
    const { tableId, tableComment, className, tplCategory, tplWebType, packageName, moduleName, businessName, functionName, functionAuthor, genType, genPath, remark, columns } = req.body;

    const table = await GenTable.findByPk(tableId);
    if (!table) {
      auditLog.result = 'FAIL';
      auditLog.error = '表不存在';
      await createAuditLog(auditLog);
      return res.json(AjaxResult.error('表不存在'));
    }

    await table.update({
      table_comment: tableComment,
      class_name: className,
      tpl_category: tplCategory,
      tpl_web_type: tplWebType,
      package_name: packageName,
      module_name: moduleName,
      business_name: businessName,
      function_name: functionName,
      function_author: functionAuthor,
      gen_type: genType,
      gen_path: genPath,
      remark: remark || '',
      update_by: req.user.userName,
    });

    if (columns && columns.length > 0) {
      for (const col of columns) {
        await GenTableColumn.update({
          column_comment: col.columnComment,
          java_type: col.javaType,
          java_field: col.javaField,
          is_pk: col.isPk,
          is_increment: col.isIncrement,
          is_required: col.isRequired,
          is_insert: col.isInsert,
          is_edit: col.isEdit,
          is_list: col.isList,
          is_query: col.isQuery,
          query_type: col.queryType,
          html_type: col.htmlType,
          dict_type: col.dictType,
          sort: col.sort,
          update_by: req.user.userName,
        }, {
          where: { column_id: col.columnId },
        });
      }
    }

    await createAuditLog(auditLog);
    res.json(AjaxResult.success());
  } catch (error) {
    auditLog.result = 'FAIL';
    auditLog.error = error.message;
    await createAuditLog(auditLog);
    console.error('修改表配置失败:', error);
    res.json(AjaxResult.error('修改表配置失败'));
  }
};

const remove = async (req, res) => {
  const startTime = new Date().toISOString();
  const { tableIds } = req.params;
  const auditLog = {
    op: 'DELETE',
    target: 'gen_table',
    targetId: tableIds,
    args: { tableIds },
    userId: req.user.userId,
    userName: req.user.userName,
    ip: req.ip,
    result: 'SUCCESS',
    error: null,
    ts: startTime,
  };

  try {
    const ids = tableIds.split(',').map(Number);

    await GenTableColumn.destroy({ where: { table_id: { [Op.in]: ids } } });
    await GenTable.destroy({ where: { table_id: { [Op.in]: ids } } });

    await createAuditLog(auditLog);
    res.json(AjaxResult.success());
  } catch (error) {
    auditLog.result = 'FAIL';
    auditLog.error = error.message;
    await createAuditLog(auditLog);
    console.error('删除表配置失败:', error);
    res.json(AjaxResult.error('删除表配置失败'));
  }
};

const preview = async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await GenTable.findByPk(tableId);
    if (!table) {
      return res.json(AjaxResult.error('表不存在'));
    }

    const columns = await GenTableColumn.findAll({
      where: { table_id: tableId },
      order: [['sort', 'ASC']],
    });

    const businessName = table.businessName || toCamelCase(table.tableName.replace(/_/g, '_'));
    const tableNameForCode = table.tableName;

    const dbColumns = columns.map(col => ({
      column_name: col.columnName,
      column_comment: col.columnComment,
      column_type: col.columnType,
      column_key: col.isPk === '1' ? 'PRI' : '',
      extra: col.isIncrement === '1' ? 'auto_increment' : '',
      is_nullable: col.isRequired === '1' ? 'NO' : 'YES',
      column_default: null,
    }));

    const tableObj = {
      tableName: tableNameForCode,
      tableComment: table.tableComment,
      moduleName: table.moduleName,
      functionName: table.functionName,
    };

    const modelCode = generateModelCode(tableObj, dbColumns);
    const controllerCode = generateControllerCode(tableObj, dbColumns);
    const routeCode = generateRouteCode(tableObj, businessName);
    const apiCode = generateApiCode(tableObj, businessName);
    const vueIndexCode = generateVueIndexCode(tableObj, columns, businessName);

    const files = {
      [`models/${toPascalCase(tableNameForCode)}.js`]: modelCode,
      [`controllers/${businessName}Controller.js`]: controllerCode,
      [`routes/${businessName}.js`]: routeCode,
      [`vue/api/${table.moduleName || 'system'}/${businessName}.js`]: apiCode,
      [`vue/views/${table.moduleName || 'system'}/${businessName}/index.vue`]: vueIndexCode,
    };

    res.json({
      code: 200,
      msg: '操作成功',
      data: files,
    });
  } catch (error) {
    console.error('预览代码失败:', error);
    res.json(AjaxResult.error('预览代码失败'));
  }
};

const download = async (req, res) => {
  try {
    const { tableName } = req.params;

    const table = await GenTable.findOne({ where: { table_name: tableName } });
    if (!table) {
      return res.json(AjaxResult.error('表不存在'));
    }

    const columns = await GenTableColumn.findAll({
      where: { table_id: table.tableId },
      order: [['sort', 'ASC']],
    });

    const businessName = table.businessName || toCamelCase(table.tableName.replace(/_/g, '_'));

    const dbColumns = columns.map(col => ({
      column_name: col.columnName,
      column_comment: col.columnComment,
      column_type: col.columnType,
      column_key: col.isPk === '1' ? 'PRI' : '',
      extra: col.isIncrement === '1' ? 'auto_increment' : '',
      is_nullable: col.isRequired === '1' ? 'NO' : 'YES',
      column_default: null,
    }));

    const tableObj = {
      tableName: table.tableName,
      tableComment: table.tableComment,
      moduleName: table.moduleName,
      functionName: table.functionName,
    };

    const modelCode = generateModelCode(tableObj, dbColumns);
    const controllerCode = generateControllerCode(tableObj, dbColumns);
    const routeCode = generateRouteCode(tableObj, businessName);
    const apiCode = generateApiCode(tableObj, businessName);
    const vueIndexCode = generateVueIndexCode(tableObj, columns, businessName);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${tableName}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    archive.append(modelCode, { name: `node/${toPascalCase(tableName)}.js` });
    archive.append(controllerCode, { name: `node/${businessName}Controller.js` });
    archive.append(routeCode, { name: `node/${businessName}.js` });
    archive.append(apiCode, { name: `vue/api/${table.moduleName || 'system'}/${businessName}.js` });
    archive.append(vueIndexCode, { name: `vue/views/${table.moduleName || 'system'}/${businessName}/index.vue` });

    await archive.finalize();
  } catch (error) {
    console.error('下载代码失败:', error);
    res.json(AjaxResult.error('下载代码失败'));
  }
};

const batchGenCode = async (req, res) => {
  try {
    const { tables } = req.query;

    if (!tables) {
      return res.json(AjaxResult.error('请选择要生成的表'));
    }

    const tableNames = tables.split(',');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=code_${Date.now()}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const tableName of tableNames) {
      const table = await GenTable.findOne({ where: { table_name: tableName } });
      if (!table) continue;

      const columns = await GenTableColumn.findAll({
        where: { table_id: table.tableId },
        order: [['sort', 'ASC']],
      });

      const businessName = table.businessName || toCamelCase(tableName.replace(/_/g, '_'));

      const dbColumns = columns.map(col => ({
        column_name: col.columnName,
        column_comment: col.columnComment,
        column_type: col.columnType,
        column_key: col.isPk === '1' ? 'PRI' : '',
        extra: col.isIncrement === '1' ? 'auto_increment' : '',
        is_nullable: col.isRequired === '1' ? 'NO' : 'YES',
        column_default: null,
      }));

      const tableObj = {
        tableName: table.tableName,
        tableComment: table.tableComment,
        moduleName: table.moduleName,
        functionName: table.functionName,
      };

      const modelCode = generateModelCode(tableObj, dbColumns);
      const controllerCode = generateControllerCode(tableObj, dbColumns);
      const routeCode = generateRouteCode(tableObj, businessName);
      const apiCode = generateApiCode(tableObj, businessName);
      const vueIndexCode = generateVueIndexCode(tableObj, columns, businessName);

      archive.append(modelCode, { name: `${tableName}/node/${toPascalCase(tableName)}.js` });
      archive.append(controllerCode, { name: `${tableName}/node/${businessName}Controller.js` });
      archive.append(routeCode, { name: `${tableName}/node/${businessName}.js` });
      archive.append(apiCode, { name: `${tableName}/vue/api/${table.moduleName || 'system'}/${businessName}.js` });
      archive.append(vueIndexCode, { name: `${tableName}/vue/views/${table.moduleName || 'system'}/${businessName}/index.vue` });
    }

    await archive.finalize();
  } catch (error) {
    console.error('批量生成代码失败:', error);
    res.json(AjaxResult.error('批量生成代码失败'));
  }
};

module.exports = { list, dbList, getInfo, importTable, updateTable, remove, preview, download, batchGenCode };
