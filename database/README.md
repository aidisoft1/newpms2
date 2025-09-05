# PostgreSQL 配置指南

## 1. 安装 PostgreSQL

### Windows
1. 下载PostgreSQL安装程序：https://www.postgresql.org/download/windows/
2. 运行安装程序，设置密码（建议使用 `postgres`）
3. 记住端口号（默认5432）和数据目录

### 使用Docker (推荐)
```bash
# 拉取PostgreSQL镜像
docker pull postgres:15

# 运行PostgreSQL容器
docker run --name newpms2-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# 进入容器
docker exec -it newpms2-postgres psql -U postgres
```

## 2. 创建数据库

### 方法1：使用psql命令行
```bash
# 连接到PostgreSQL
psql -U postgres -h localhost -p 5432

# 创建数据库
CREATE DATABASE newpms2_dev;

# 退出
\q
```

### 方法2：使用迁移脚本（推荐）
```bash
# 在项目根目录运行
node database/migrate.js

# 强制重新创建（清空所有数据）
node database/migrate.js --force
```

## 3. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newpms2_dev
DB_USER=postgres
DB_PASSWORD=你的密码

# 其他配置
NODE_ENV=development
JWT_SECRET=你的JWT密钥
PORT=3000
```

## 4. 测试连接

```bash
# 测试数据库连接
node test-db.js

# 启动服务器
npm start
# 或
node server.js
```

## 5. 常用PostgreSQL命令

```sql
-- 查看所有数据库
\l

-- 连接到特定数据库
\c newpms2_dev

-- 查看所有表
\dt

-- 查看表结构
\d table_name

-- 查看PostgreSQL版本
SELECT version();

-- 查看当前连接信息
\conninfo
```

## 6. 数据库管理工具（可选）

- **pgAdmin**: PostgreSQL官方图形化管理工具
- **DBeaver**: 通用数据库管理工具
- **DataGrip**: JetBrains的数据库IDE

## 7. 性能调优建议

### postgresql.conf 配置
```ini
# 内存相关
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB

# 连接相关
max_connections = 100

# 日志相关
log_statement = 'all'  # 开发环境
log_duration = on
```

## 8. 备份和恢复

### 备份
```bash
# 备份单个数据库
pg_dump -U postgres -h localhost newpms2_dev > backup.sql

# 备份所有数据库
pg_dumpall -U postgres -h localhost > all_backup.sql
```

### 恢复
```bash
# 恢复数据库
psql -U postgres -h localhost newpms2_dev < backup.sql
```

## 9. 故障排除

### 常见问题

1. **连接被拒绝**
   - 检查PostgreSQL服务是否启动
   - 检查端口是否正确
   - 检查防火墙设置

2. **密码认证失败**
   - 确认用户名和密码正确
   - 检查pg_hba.conf配置

3. **数据库不存在**
   - 确认数据库名称正确
   - 运行数据库创建脚本

### 日志位置
- Windows: `C:\Program Files\PostgreSQL\15\data\log\`
- Linux: `/var/log/postgresql/`
- Docker: `docker logs newpms2-postgres`

## 10. 开发环境启动清单

1. ✅ PostgreSQL服务启动
2. ✅ 数据库 `newpms2_dev` 已创建
3. ✅ `.env` 文件配置正确
4. ✅ 运行 `node test-db.js` 测试连接
5. ✅ 运行 `node database/migrate.js` 初始化表结构
6. ✅ 运行 `node server.js` 启动后端服务
7. ✅ 运行 `npm run dev` 启动前端服务
