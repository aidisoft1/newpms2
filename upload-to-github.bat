@echo off
echo ========================================
echo 项目上传到 GitHub 脚本
echo ========================================
echo.

echo 1. 检查 Git 状态...
git status
echo.

echo 2. 添加所有文件到暂存区...
git add .
echo.

echo 3. 显示即将提交的文件...
git status --short
echo.

echo 请按任意键继续提交，或按 Ctrl+C 取消...
pause > nul

echo 4. 提交更改到本地仓库...
git commit -m "feat: PostgreSQL 数据库迁移完成 - 完整项目上传"
echo.

echo ========================================
echo 下一步：连接到 GitHub 仓库
echo ========================================
echo.
echo 1. 在 GitHub 上创建新仓库（如果还没有）
echo    - 访问 https://github.com
echo    - 点击 "New repository"
echo    - 仓库名称：newpms2
echo    - 描述：物业管理系统 - PostgreSQL版本
echo    - 不要勾选 "Initialize with README"
echo.
echo 2. 复制下面的命令并替换 YOUR_USERNAME：
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/newpms2.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 如果仓库已存在，直接推送：
echo.
echo    git push origin main
echo.

pause
