class AjaxResult {
  static success(data = null, msg = '操作成功') {
    return { code: 200, msg, data };
  }

  static error(msg = '操作失败', code = 500) {
    return { code, msg, data: null };
  }

  static warn(msg = '警告', code = 301) {
    return { code, msg, data: null };
  }
}

class TableDataInfo {
  constructor(list, total, pageNum, pageSize) {
    this.code = 200;
    this.msg = '查询成功';
    this.rows = list;
    this.total = total;
    this.pageNum = pageNum;
    this.pageSize = pageSize;
  }
}

module.exports = { AjaxResult, TableDataInfo };
