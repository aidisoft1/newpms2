@echo off
cd /d D:\newpms2
echo ========================================
echo 测试后端服务启动
echo ========================================
echo.

echo 1. 检查环境配置...
if not exist .env (
    echo ❌ .env 文件不存在
    pause
    exit /b 1
)

echo 2. 检查 package.json...
if not exist package.json (
    echo ❌ package.json 文件不存在
    pause
    exit /b 1
)

echo 3. 检查 server.js...
if not exist server.js (
    echo ❌ server.js 文件不存在
    pause
    exit /b 1
)

echo 4. 显示当前配置...
echo 数据库配置:
type .env
echo.

echo 5. 测试数据库连接...
node test-remote-connection.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ 数据库连接失败，请检查配置
    echo 💡 建议：先修复数据库连接问题
    pause
    exit /b 1
)

echo.
echo 6. 启动后端服务...
echo ✅ 所有检查通过，正在启动服务器...
echo.
npm start
