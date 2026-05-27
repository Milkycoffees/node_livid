const { SysAuditLog } = require('../models');

const createAuditLog = async (auditData) => {
  try {
    const logData = {
      op: auditData.op,
      target: auditData.target,
      targetId: auditData.targetId || '',
      args: auditData.args || null,
      userId: auditData.userId,
      userName: auditData.userName,
      ip: auditData.ip,
      result: auditData.result || 'SUCCESS',
      error: auditData.error || null,
      ts: auditData.ts || new Date().toISOString(),
      createBy: auditData.userName,
      createTime: new Date(),
      updateBy: auditData.userName,
      updateTime: new Date(),
    };

    const auditLog = await SysAuditLog.create(logData);
    console.log('[AUDIT-LOG]', JSON.stringify(logData));
    return auditLog;
  } catch (error) {
    console.error('审计日志记录失败:', error);
    throw error;
  }
};

module.exports = { createAuditLog };
