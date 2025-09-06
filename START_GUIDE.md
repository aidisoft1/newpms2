# 🚀 正确的服务启动命令

## ❌ 错误的命令
```bash
node start  # 这是错误的！
```

## ✅ 正确的命令

### 1. 启动后端服务
```bash
cd d:\newpms2
npm start
```
或者直接运行：
```bash
cd d:\newpms2
node server.js
```

### 2. 启动前端开发服务
```bash
cd d:\newpms2
npm run dev
```

## 📋 完整启动流程

### 步骤1: 检查数据库连接
```bash
cd d:\newpms2
node test-remote-connection.js
```

### 步骤2: 启动后端服务（新终端窗口）
```bash
cd d:\newpms2
npm start
```
看到类似输出表示成功：
```
服务器运行在端口 3000
数据库连接成功
```

### 步骤3: 启动前端服务（另一个新终端窗口）
```bash
cd d:\newpms2
npm run dev
```
看到类似输出表示成功：
```
Local:   http://192.168.1.10:5173/
Network: http://192.168.x.x:5173/
```

### 步骤4: 访问应用
- 前端界面: http://192.168.1.10:5173
- 后端API: http://192.168.1.10:3000/api

## 🔧 故障排除

### 如果后端启动失败
1. **检查端口占用**:
   ```bash
   netstat -an | findstr :3000
   ```

2. **检查数据库连接**:
   ```bash
   node test-remote-connection.js
   ```

3. **查看详细错误信息**:
   ```bash
   node server.js
   ```

### 如果前端启动失败
1. **重新安装依赖**:
   ```bash
   npm install
   ```

2. **清除缓存**:
   ```bash
   npm run build
   ```

## 🎯 快速启动脚本

创建一个批处理文件来快速启动：

**start-backend.bat**:
```batch
@echo off
cd /d D:\newpms2
echo 启动后端服务...
npm start
pause
```

**start-frontend.bat**:
```batch
@echo off
cd /d D:\newpms2
echo 启动前端服务...
npm run dev
pause
```
