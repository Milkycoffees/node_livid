const sequelize = require('../../config/db');
const config = require('../../config');

const getDbTables = async (tableNames = []) => {
  const dbName = config.db.database;
  let sql = `
    SELECT
      table_name,
      table_comment,
      create_time,
      update_time
    FROM information_schema.tables
    WHERE table_schema = ?
      AND table_name NOT LIKE 'gen_%'
      AND table_name NOT LIKE 'sys_%'
      AND table_type = 'BASE TABLE'
  `;
  const params = [dbName];

  if (tableNames && tableNames.length > 0) {
    sql += ` AND table_name IN (?)`;
    params.push(tableNames);
  }

  sql += ` ORDER BY create_time DESC`;

  const [rows] = await sequelize.query(sql, { replacements: params });
  return rows;
};

const getDbTableColumns = async (tableName) => {
  const dbName = config.db.database;
  const sql = `
    SELECT
      column_name,
      column_comment,
      column_type,
      column_key,
      extra,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns
    WHERE table_schema = ?
      AND table_name = ?
    ORDER BY ordinal_position
  `;

  const [rows] = await sequelize.query(sql, {
    replacements: [dbName, tableName],
  });
  return rows;
};

const columnTypeToJsType = (columnType, columnName) => {
  const type = columnType.toLowerCase();

  if (type.includes('int') || type.includes('tinyint') || type.includes('smallint') || type.includes('mediumint') || type.includes('bigint')) {
    return 'INTEGER';
  }
  if (type.includes('float') || type.includes('double') || type.includes('decimal') || type.includes('numeric')) {
    return 'FLOAT';
  }
  if (type.includes('datetime') || type.includes('timestamp')) {
    return 'DATE';
  }
  if (type.includes('date')) {
    return 'DATEONLY';
  }
  if (type.includes('time')) {
    return 'TIME';
  }
  if (type.includes('text') || type.includes('longtext') || type.includes('mediumtext')) {
    return 'TEXT';
  }
  if (type.includes('blob') || type.includes('binary')) {
    return 'BLOB';
  }
  if (type.includes('json')) {
    return 'JSON';
  }
  if (type.includes('char') || type.includes('varchar') || type.includes('enum') || type.includes('set')) {
    return 'STRING';
  }

  return 'STRING';
};

const columnTypeToSequelizeType = (columnType) => {
  const type = columnType.toLowerCase();

  if (type.includes('bigint')) {
    return 'BIGINT';
  }
  if (type.includes('int') || type.includes('tinyint') || type.includes('smallint') || type.includes('mediumint')) {
    return 'INTEGER';
  }
  if (type.includes('float') || type.includes('double')) {
    return 'FLOAT';
  }
  if (type.includes('decimal') || type.includes('numeric')) {
    return 'DECIMAL';
  }
  if (type.includes('datetime') || type.includes('timestamp')) {
    return 'DATE';
  }
  if (type.includes('date')) {
    return 'DATEONLY';
  }
  if (type.includes('time')) {
    return 'TIME';
  }
  if (type.includes('text') || type.includes('longtext') || type.includes('mediumtext')) {
    return 'TEXT';
  }
  if (type.includes('blob') || type.includes('binary')) {
    return 'BLOB';
  }
  if (type.includes('json')) {
    return 'JSON';
  }
  if (type.includes('boolean') || type === 'tinyint(1)') {
    return 'BOOLEAN';
  }

  return 'STRING';
};

const extractColumnSize = (columnType) => {
  const match = columnType.match(/\((\d+)(?:,\d+)?\)/);
  return match ? parseInt(match[1], 10) : null;
};

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const toPascalCase = (str) => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const getJsType = (columnType) => {
  const type = columnType.toLowerCase();

  if (type.includes('bigint')) return 'Long';
  if (type.includes('int') || type.includes('tinyint') || type.includes('smallint') || type.includes('mediumint')) return 'Integer';
  if (type.includes('float') || type.includes('double') || type.includes('decimal') || type.includes('numeric')) return 'Double';
  if (type.includes('datetime') || type.includes('timestamp')) return 'Date';
  if (type.includes('date')) return 'Date';
  if (type.includes('time')) return 'Date';

  return 'String';
};

const getHtmlType = (columnName, columnType) => {
  const name = columnName.toLowerCase();
  const type = columnType.toLowerCase();

  if (name.includes('time') || name.includes('date')) {
    if (type.includes('datetime') || type.includes('timestamp')) return 'datetime';
    if (type.includes('date')) return 'date';
    if (type.includes('time')) return 'time';
  }

  if (name.includes('content') || name.includes('description') || name.includes('remark') || name.includes('memo')) {
    return 'textarea';
  }

  if (name.includes('image') || name.includes('img') || name.includes('avatar') || name.includes('pic')) {
    return 'imageUpload';
  }

  if (name.includes('file')) {
    return 'fileUpload';
  }

  if (type.includes('text') || type.includes('longtext')) {
    return 'textarea';
  }

  return 'input';
};

const getQueryType = (columnName, columnType) => {
  const name = columnName.toLowerCase();
  const type = columnType.toLowerCase();

  if (type.includes('varchar') || type.includes('char') || type.includes('text')) {
    if (name.includes('name') || name.includes('title') || name.includes('like')) {
      return 'LIKE';
    }
    return 'EQ';
  }

  return 'EQ';
};

const processColumns = (columns) => {
  return columns.map((col, index) => {
    const javaField = toCamelCase(col.column_name);
    const javaType = getJsType(col.column_type);
    const htmlType = getHtmlType(col.column_name, col.column_type);
    const queryType = getQueryType(col.column_name, col.column_type);
    const isPk = col.column_key === 'PRI' ? '1' : '0';
    const isIncrement = col.extra === 'auto_increment' ? '1' : '0';
    const isRequired = col.is_nullable === 'NO' && !col.column_default && isPk === '0' ? '1' : '0';
    const isInsert = isPk === '0' && isIncrement === '0' ? '1' : '0';
    const isEdit = isPk === '0' ? '1' : '0';
    const isList = '1';
    const isQuery = queryType !== 'EQ' || (col.column_name !== 'create_time' && col.column_name !== 'update_time' && col.column_name !== 'create_by' && col.column_name !== 'update_by' && col.column_name !== 'del_flag') ? '1' : '0';

    return {
      columnName: col.column_name,
      columnComment: col.column_comment || col.column_name,
      columnType: col.column_type,
      javaType,
      javaField,
      isPk,
      isIncrement,
      isRequired,
      isInsert,
      isEdit,
      isList,
      isQuery,
      queryType,
      htmlType,
      dictType: '',
      sort: index,
    };
  });
};

module.exports = {
  getDbTables,
  getDbTableColumns,
  columnTypeToJsType,
  columnTypeToSequelizeType,
  extractColumnSize,
  toCamelCase,
  toPascalCase,
  processColumns,
};
