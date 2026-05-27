# ADD 审计日志范式技能

## 技能名称
add-paradigm

## 触发条件
任何涉及数据变更的接口代码编写或修改时自动触发。包括但不限于：
- 用户管理接口（新增/修改/删除/重置密码）
- 角色管理接口（新增/修改/删除）
- 菜单管理接口（新增/修改/删除）
- 部门管理接口（新增/修改/删除）
- 岗位管理接口（新增/修改/删除）
- 字典管理接口（新增/修改/删除）
- 参数配置接口（新增/修改/删除）

## 核心原则

**"谁污染谁治理，谁制造副本谁举证"**

任何数据变更操作都必须有对应的审计日志，确保操作可追溯、可举证。

## 审计日志模型定义

```javascript
const SysOperLog = sequelize.define('SysOperLog', {
  operId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'oper_id' },
  title: { type: DataTypes.STRING(50), defaultValue: '', field: 'title' },
  businessType: { type: DataTypes.INTEGER, defaultValue: 0, field: 'business_type' },
  method: { type: DataTypes.STRING(100), defaultValue: '', field: 'method' },
  requestMethod: { type: DataTypes.STRING(10), defaultValue: '', field: 'request_method' },
  operatorType: { type: DataTypes.INTEGER, defaultValue: 0, field: 'operator_type' },
  operName: { type: DataTypes.STRING(50), defaultValue: '', field: 'oper_name' },
  deptName: { type: DataTypes.STRING(50), defaultValue: '', field: 'dept_name' },
  operUrl: { type: DataTypes.STRING(255), defaultValue: '', field: 'oper_url' },
  operIp: { type: DataTypes.STRING(128), defaultValue: '', field: 'oper_ip' },
  operLocation: { type: DataTypes.STRING(255), defaultValue: '', field: 'oper_location' },
  operParam: { type: DataTypes.STRING(2000), defaultValue: '', field: 'oper_param' },
  jsonResult: { type: DataTypes.STRING(2000), defaultValue: '', field: 'json_result' },
  status: { type: DataTypes.INTEGER, defaultValue: 0, field: 'status' },
  errorMsg: { type: DataTypes.STRING(2000), defaultValue: '', field: 'error_msg' },
  operTime: { type: DataTypes.DATE, field: 'oper_time' },
  costTime: { type: DataTypes.BIGINT, defaultValue: 0, field: 'cost_time' },
}, {
  tableName: 'sys_oper_log',
  timestamps: false,
});
```

## 审计日志工具函数

```javascript
const logOperation = async (req, { title, businessType, method, status, jsonResult, errorMsg }) => {
  try {
    await SysOperLog.create({
      title,
      businessType,
      method,
      requestMethod: req.method,
      operatorType: 1,
      operName: req.user?.userName || 'unknown',
      operUrl: req.originalUrl,
      operIp: req.ip,
      operParam: JSON.stringify(req.body).substring(0, 2000),
      jsonResult: JSON.stringify(jsonResult).substring(0, 2000),
      status,
      errorMsg: errorMsg?.substring(0, 2000),
      operTime: new Date(),
    });
  } catch (err) {
    console.error('审计日志记录失败:', err);
  }
};
```

## 使用示例

### 用户新增
```javascript
const add = async (req, res) => {
  const startTime = Date.now();
  try {
    // 业务逻辑...
    const user = await SysUser.create({ ... });
    
    await logOperation(req, {
      title: '用户管理',
      businessType: 1, // 1=新增
      method: 'userController.add',
      status: 0, // 0=成功
      jsonResult: { userId: user.userId },
    });
    
    res.json(AjaxResult.success());
  } catch (error) {
    await logOperation(req, {
      title: '用户管理',
      businessType: 1,
      method: 'userController.add',
      status: 1, // 1=失败
      errorMsg: error.message,
    });
    
    res.json(AjaxResult.error('新增用户失败'));
  }
};
```

### 用户修改
```javascript
const update = async (req, res) => {
  try {
    // 业务逻辑...
    await user.update({ ... });
    
    await logOperation(req, {
      title: '用户管理',
      businessType: 2, // 2=修改
      method: 'userController.update',
      status: 0,
      jsonResult: { userId },
    });
    
    res.json(AjaxResult.success());
  } catch (error) {
    await logOperation(req, {
      title: '用户管理',
      businessType: 2,
      method: 'userController.update',
      status: 1,
      errorMsg: error.message,
    });
    
    res.json(AjaxResult.error('修改用户失败'));
  }
};
```

### 用户删除
```javascript
const remove = async (req, res) => {
  try {
    // 业务逻辑...
    await SysUser.update({ del_flag: '2' }, { where: { user_id: ids } });
    
    await logOperation(req, {
      title: '用户管理',
      businessType: 3, // 3=删除
      method: 'userController.remove',
      status: 0,
      jsonResult: { userIds: ids },
    });
    
    res.json(AjaxResult.success());
  } catch (error) {
    await logOperation(req, {
      title: '用户管理',
      businessType: 3,
      method: 'userController.remove',
      status: 1,
      errorMsg: error.message,
    });
    
    res.json(AjaxResult.error('删除用户失败'));
  }
};
```

## BusinessType 枚举

| 值 | 说明 |
|---|------|
| 0 | 其它 |
| 1 | 新增 |
| 2 | 修改 |
| 3 | 删除 |
| 4 | 授权 |
| 5 | 导出 |
| 6 | 导入 |
| 7 | 强退 |
| 8 | 清空数据 |

## 硬性约束

1. **不可跳过审计日志** - 任何数据变更操作必须有对应的审计日志
2. **日志与业务同步** - 审计日志必须在同一请求中完成，不可异步延迟
3. **错误也要记录** - 业务失败时必须记录失败状态和错误信息
4. **参数脱敏** - 密码等敏感字段不可记录到 oper_param
