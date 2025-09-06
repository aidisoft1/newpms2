# 新增记录无法保存到数据库 - 问题修复指南

## 问题诊断

经过检查，发现了以下问题：

### 1. 字段名称不一致
- **问题**: 路由中使用的字段名和模型定义不一致
- **解决**: 已统一字段命名规范

### 2. 数据库连接问题
- **问题**: PostgreSQL 服务可能未启动或连接配置错误
- **表现**: 无法连接到数据库，导致数据无法保存

### 3. 表结构同步问题
- **问题**: 数据库表结构与模型定义不匹配
- **解决**: 需要重新运行迁移脚本

## 已修复的文件

### 1. 模型文件修复
- `server/models/Garden.js` - 统一字段名为小写，启用时间戳
- `server/models/Build.js` - 规范字段定义和外键关联
- `server/models/Room.js` - 更新表名和字段定义
- `server/models/Customer.js` - 统一命名规范

### 2. 路由文件修复
- `server/routes/Garden.js` - 修正查询和更新字段名
- `server/routes/Build.js` - 统一字段名称
- `server/routes/Room.js` - 更新字段引用

## 启动步骤

### 步骤1: 启动 PostgreSQL 服务
```bash
# Windows 系统
net start postgresql-x64-13
# 或者通过服务管理器启动 PostgreSQL 服务
```

### 步骤2: 检查数据库连接
```bash
cd d:\newpms2
node quick-test.js
```

### 步骤3: 运行数据库迁移
```bash
cd d:\newpms2
node database/migrate-fixed.js
```

### 步骤4: 启动服务
```bash
# 启动后端
npm start

# 启动前端 (另一个终端)
npm run dev
```

## 测试新增记录

### 1. 通过 API 测试
```bash
curl -X POST http://192.168.1.10:3000/api/gardens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试管理区",
    "address": "测试地址",
    "description": "测试描述"
  }'
```

### 2. 通过前端页面测试
- 访问前端页面
- 尝试新增管理区、楼栋、房间等记录
- 检查是否能成功保存

## 故障排查

如果仍然无法保存数据，请按以下步骤排查：

1. **检查 PostgreSQL 服务状态**
   ```bash
   Get-Service postgresql*
   netstat -an | findstr :5432
   ```

2. **检查数据库连接配置**
   - 确认 `.env` 文件中的数据库配置正确
   - 测试数据库连接: `node quick-test.js`

3. **检查表结构**
   ```bash
   node check-tables.js
   ```

4. **检查服务日志**
   - 查看后端服务的控制台输出
   - 检查是否有数据库连接错误或SQL错误

5. **检查网络和防火墙**
   - 确保 5432 端口未被防火墙阻止
   - 检查 PostgreSQL 配置允许本地连接

## 注意事项

1. 所有模型字段已统一为小写命名
2. 启用了时间戳功能 (created_at, updated_at)
3. 使用下划线命名法 (underscored: true)
4. 表名使用复数形式 (gardens, buildings, rooms, customers)

修复完成后，新增记录应该能够正常保存到数据库中。
