# 会话初始化技能

## 技能名称
session-init

## 触发条件
每次用户发起新会话或会话空闲超过 10 分钟后自动触发。

## 目的
确保在每次会话开始时完成必要的初始化操作，包括加载项目上下文、检查服务状态和验证环境变量。

## 初始化步骤

### 1. 验证环境变量

检查 `.env` 文件中的必需配置项：
- `DB_HOST` - 数据库主机
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称
- `JWT_SECRET` - JWT 密钥

### 2. 检查项目结构

确认以下核心文件存在：
```
src/
├── app.js              # 应用入口
├── config/
│   ├── index.js        # 配置模块
│   ├── db.js           # 数据库配置
│   └── redis.js        # Redis 配置
├── controllers/        # 控制器
├── middlewares/        # 中间件
├── models/             # 数据模型
├── routes/             # 路由
└── utils/              # 工具函数
```

### 3. 检查 Docker 服务

确认以下服务正在运行：
- MySQL 容器 (`node-livid-mysql`)
- Redis 容器 (`node-livid-redis`)

检查命令：
```bash
docker compose ps
```

### 4. 检查数据库连接

验证数据库连接是否正常：
```bash
node -e "const db = require('./src/config/db'); db.authenticate().then(() => console.log('OK')).catch(e => console.error(e))"
```

### 5. 加载项目规则

读取并应用 `.trae/rules/project_rules.md` 中的规则：
- ADD 审计日志范式
- Livid 接口兼容性要求
- 数据库操作规范
- 认证授权规范

## 初始化完成标志

所有检查通过后，输出：
```
✓ 环境变量已加载
✓ 项目结构完整
✓ Docker 服务运行中
✓ 数据库连接正常
✓ 项目规则已加载
会话初始化完成
```

## 失败处理

如果任何步骤失败：
1. 输出具体的错误信息
2. 提供修复建议
3. 阻止后续操作直到问题解决

## 快速修复命令

```bash
# 启动 Docker 服务
./docker-start.sh start

# 初始化数据库
npm run db:init

# 插入种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```
