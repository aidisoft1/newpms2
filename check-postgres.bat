@echo off
echo PostgreSQL环境检查工具
echo ========================

echo.
echo 1. 检查PostgreSQL服务状态:
sc query postgresql-x64-15 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL-15服务已安装
) else (
    echo PostgreSQL-15服务未找到
)

sc query postgresql-x64-14 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL-14服务已安装
) else (
    echo PostgreSQL-14服务未找到
)

sc query postgresql-x64-13 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL-13服务已安装
) else (
    echo PostgreSQL-13服务未找到
)

echo.
echo 2. 检查端口5432:
netstat -an | findstr :5432
if %errorlevel% equ 0 (
    echo 端口5432正在使用
) else (
    echo 端口5432未使用
)

echo.
echo 3. 检查PostgreSQL进程:
tasklist | findstr postgres
if %errorlevel% equ 0 (
    echo 找到PostgreSQL进程
) else (
    echo 未找到PostgreSQL进程
)

echo.
echo 4. 检查常见安装路径:
if exist "C:\Program Files\PostgreSQL" (
    echo 找到PostgreSQL安装目录: C:\Program Files\PostgreSQL
    dir "C:\Program Files\PostgreSQL" /b
) else (
    echo 未找到标准PostgreSQL安装目录
)

echo.
echo 5. 尝试启动PostgreSQL服务:
echo 如果服务已安装但未启动，可以运行:
echo net start postgresql-x64-15
echo 或
echo net start postgresql-x64-14

pause
