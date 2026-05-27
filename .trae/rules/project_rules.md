# Node Livid 项目开发规则

## 硬性约束（绝对不可违反）

### 1. ADD 审计日志范式

任何涉及数据变更的接口（增删改操作）必须同步提交 ADD 审计日志。

**覆盖范围：**
- 用户管理接口（新增/修改/删除/重置密码）
- 角色管理接口（新增/修改/删除）
- 菜单管理接口（新增/修改/删除）
- 部门管理接口（新增/修改/删除）
- 岗位管理接口（新增/修改/删除）
- 字典管理接口（新增/修改/删除）
- 参数配置接口（新增/修改/删除）

**审计日志必需字段：**
```javascript
{
  op: 'CREATE | UPDATE | DELETE',     // 操作类型
  target: 'user | role | menu ...',   // 操作对象
  targetId: '1,2,3',                  // 操作对象ID
  args: { ... },                      // 操作参数
  userId: 1,                          // 操作人ID
  userName: 'admin',                  // 操作人用户名
  ip: '127.0.0.1',                    // 操作IP
  result: 'SUCCESS | FAIL',           // 操作结果
  error: null,                        // 错误信息
  ts: '2024-01-01T00:00:00.000Z'      // 操作时间戳
}
```

**设计原则：** "谁污染谁治理，谁制造副本谁举证"

### 2. Livid 接口兼容性

所有接口必须保持与 Livid Java 版本完全兼容：
- 接口路径一致：`/dev-api/system/user/list`
- 响应格式一致：`{ code: 200, msg: "操作成功", data: ... }`
- 分页格式一致：`{ code: 200, msg: "查询成功", rows: [...], total: 100 }`
- 认证方式一致：JWT Bearer Token

### 3. 数据库操作规范

- 所有数据库操作使用 Sequelize ORM，禁止直接拼接 SQL
- 软删除使用 `del_flag` 字段，值为 '0' 正常、'2' 已删除
- 时间字段使用 `create_time`、`update_time` 自动维护
- 操作人字段使用 `create_by`、`update_by`

### 4. 认证授权规范

- JWT Token 必须从 `Authorization: Bearer {token}` 获取
- Token 过期时间默认 24 小时
- 密码使用 bcrypt 加密，salt rounds = 10
- 超级管理员角色 key 固定为 `admin`

### 5. 环境变量规范

- 敏感配置必须从环境变量读取，禁止硬编码
- 数据库密码、JWT Secret 等不得提交到代码仓库
- 使用 `.env` 文件管理本地开发配置

## 指导原则（强烈建议遵守）

### 1. 单一职责
每个控制器只处理一个业务领域，每个服务只封装一类业务逻辑。

### 2. 中间件复用
认证、分页、错误处理等通用逻辑必须抽取为中间件。

### 3. 统一响应
所有接口返回必须使用 `AjaxResult` 或 `TableDataInfo` 包装。

### 4. 参数校验
使用 `express-validator` 对请求参数进行校验。

### 5. 错误处理
所有异步操作必须有 try-catch，错误信息统一通过 `AjaxResult.error` 返回。

## 禁止项

1. **不可修改认证流程的核心逻辑**（login、getInfo、getRouters）
2. **不可硬编码数据库密码、JWT Secret 等敏感信息**
3. **不可直接使用 `res.json({ code: 200 })`，必须使用 `AjaxResult.success()`**
4. **不可跳过审计日志直接执行数据变更操作**
5. **不可修改已有的数据库表结构字段名**

## 代码风格

- 使用 CommonJS 模块规范（require/module.exports）
- 不添加注释，代码即文档
- 变量命名使用 camelCase
- 数据库字段映射使用 Sequelize 的 `field` 属性
