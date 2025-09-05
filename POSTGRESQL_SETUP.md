# PostgreSQL 快速启动指南

## 📋 当前状态检查

根据测试结果，PostgreSQL可能需要启动或配置。请按以下步骤操作：

## 🚀 方法1：启动已安装的PostgreSQL服务

### 1. 查找PostgreSQL服务
在Windows搜索栏输入"服务"，打开服务管理器，查找以下服务：
- `postgresql-x64-15`
- `postgresql-x64-14` 
- `postgresql-x64-13`
- 或其他版本

### 2. 启动服务
右键点击PostgreSQL服务 → 启动

### 3. 或使用命令行启动
```cmd
# 以管理员身份运行CMD，然后执行：
net start postgresql-x64-15
# 或根据你的版本调整数字
```

## 🐳 方法2：使用Docker运行PostgreSQL (推荐)

如果没有安装PostgreSQL或者想要快速开始：

```bash
# 1. 安装Docker Desktop (如果没有)
# 下载：https://www.docker.com/products/docker-desktop

# 2. 运行PostgreSQL容器
docker run --name newpms2-postgres -e POSTGRES_PASSWORD=Aidisoft -e POSTGRES_DB=sample -p 5432:5432 -d postgres:15

# 3. 验证容器运行
docker ps

# 4. 连接到数据库 (可选)
docker exec -it newpms2-postgres psql -U postgres -d sample
```

## 💾 方法3：全新安装PostgreSQL

### Windows安装：
1. 访问：https://www.postgresql.org/download/windows/
2. 下载PostgreSQL安装程序
3. 安装时设置：
   - 超级用户密码：`Aidisoft`
   - 端口：`5432`
   - 创建数据库：`sample`

## ✅ 验证安装

完成任何一种方法后，运行测试：

```bash
# 测试连接
node pg-diagnosis.js

# 或使用npm脚本
npm run test:db
```

## 🔧 常见问题解决

### 问题1：端口被占用
```bash
# 查看占用5432端口的进程
netstat -ano | findstr :5432
# 结束进程或更改PostgreSQL端口
```

### 问题2：密码认证失败
1. 确认密码是否为 `Aidisoft`
2. 检查pg_hba.conf配置文件
3. 重启PostgreSQL服务

### 问题3：数据库不存在
```sql
-- 连接到postgres默认数据库
psql -U postgres
-- 创建sample数据库
CREATE DATABASE sample;
```

## 🎯 下一步

PostgreSQL运行后，依次执行：

1. `npm run test:db` - 测试连接
2. `npm run migrate` - 初始化数据表
3. `npm start` - 启动后端服务
4. `npm run dev` - 启动前端服务

---

**需要帮助？** 请告诉我您选择了哪种方法，以及遇到的具体问题！
