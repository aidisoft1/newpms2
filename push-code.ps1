# 推送代码到GitHub脚本
# 使用方法：在PowerShell中运行 .\push-code.ps1

param(
    [string]$message = "Update code"
)

Write-Host "=== 推送代码到GitHub ===" -ForegroundColor Green

# 检查Git是否已安装
try {
    git --version
} catch {
    Write-Host "✗ Git 未安装，请先运行 .\setup-git.ps1" -ForegroundColor Red
    exit 1
}

# 检查是否是Git仓库
if (-not (Test-Path ".git")) {
    Write-Host "✗ 当前目录不是Git仓库，请先运行 .\setup-git.ps1" -ForegroundColor Red
    exit 1
}

# 显示当前状态
Write-Host "检查代码更改..." -ForegroundColor Yellow
git status

# 询问是否继续
$choice = Read-Host "是否添加所有更改并推送？(y/n)"
if ($choice -ne "y" -and $choice -ne "Y") {
    Write-Host "操作已取消" -ForegroundColor Red
    exit 1
}

try {
    # 添加所有更改
    Write-Host "添加文件更改..." -ForegroundColor Yellow
    git add .
    
    # 提交更改
    Write-Host "提交更改..." -ForegroundColor Yellow
    git commit -m "$message"
    
    # 推送到远程仓库
    $currentBranch = git branch --show-current
    Write-Host "推送到远程分支 $currentBranch..." -ForegroundColor Yellow
    git push origin $currentBranch
    
    Write-Host "✓ 成功推送代码到GitHub" -ForegroundColor Green
    
} catch {
    Write-Host "✗ 推送失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查网络连接和权限设置" -ForegroundColor Yellow
}

Write-Host "`n完成！" -ForegroundColor Green
