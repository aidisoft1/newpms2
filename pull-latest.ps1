# 拉取GitHub仓库最新版本脚本
# 使用方法：在PowerShell中运行 .\pull-latest.ps1

Write-Host "=== 拉取最新版本 ===" -ForegroundColor Green

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

# 检查当前分支
$currentBranch = git branch --show-current
Write-Host "当前分支：$currentBranch" -ForegroundColor Cyan

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "警告：有未提交的更改" -ForegroundColor Yellow
    Write-Host $status
    $choice = Read-Host "是否继续拉取？(y/n)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "操作已取消" -ForegroundColor Red
        exit 1
    }
}

# 拉取最新版本
Write-Host "正在拉取最新版本..." -ForegroundColor Yellow

try {
    # 首先获取远程更新
    git fetch origin
    
    # 然后合并更改
    git pull origin $currentBranch
    
    Write-Host "✓ 成功拉取最新版本" -ForegroundColor Green
    
    # 显示最新的几次提交
    Write-Host "`n最近的提交记录：" -ForegroundColor Cyan
    git log --oneline -5
    
} catch {
    Write-Host "✗ 拉取失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查网络连接和远程仓库地址" -ForegroundColor Yellow
}

Write-Host "`n完成！" -ForegroundColor Green
