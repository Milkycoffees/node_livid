const sequelize = require('../config/db');
const { SysAuditLog } = require('../models');

const createAuditLogTable = async () => {
  try {
    console.log('开始创建审计日志表...');
    
    await sequelize.getQueryInterface().dropTable('sys_audit_log').catch(() => {});
    await sequelize.getQueryInterface().dropTable('sys_add_log').catch(() => {});
    console.log('旧表已删除');
    
    await SysAuditLog.sync({ force: false });
    console.log('新表 pro_add_log 创建成功');
    
    console.log('操作完成');
    process.exit(0);
  } catch (error) {
    console.error('创建审计日志表失败:', error);
    process.exit(1);
  }
};

createAuditLogTable();
