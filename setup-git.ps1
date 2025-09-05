# Git 仓库设置脚本（简化、兼容）
# 使用方法：在 PowerShell 中运行 .\setup-git.ps1

Write-Host '=== Git 仓库设置向导 ===' -ForegroundColor Green

# 检查 Git 是否可用
$gitAvailable = $false
try {
    git --version | Out-Null
    $gitAvailable = $true
} catch {
    $gitAvailable = $false
}

if (-not $gitAvailable) {
    Write-Host '✗ Git 未安装或不可用，请先安装 Git for Windows' -ForegroundColor Red
    Write-Host '下载地址：https://git-scm.com/download/win' -ForegroundColor Yellow
    exit 1
}

# 进入当前目录（脚本假定在项目根运行）
Write-Host "当前目录：$(Get-Location)" -ForegroundColor Cyan

# 初始化仓库（如果尚未初始化）
if (Test-Path '.git') {
    Write-Host '✓ 当前目录已是 Git 仓库' -ForegroundColor Green
} else {
    Write-Host '初始化 Git 仓库...' -ForegroundColor Yellow
    git init
}

# 配置全局用户信息（若未配置）
$userName = ''
$userEmail = ''
try { $userName = (git config --global user.name) } catch {}
try { $userEmail = (git config --global user.email) } catch {}

if ([string]::IsNullOrWhiteSpace($userName)) {
    $inputName = Read-Host '请输入你的 Git 用户名（如：yourname）'
    if ($inputName) { git config --global user.name $inputName }
}
if ([string]::IsNullOrWhiteSpace($userEmail)) {
    $inputEmail = Read-Host '请输入你的邮箱（如：you@example.com）'
    if ($inputEmail) { git config --global user.email $inputEmail }
}

# 添加或更新远程仓库 origin（可留空跳过）
$remoteUrl = Read-Host '请输入远程仓库 URL（例如：https://github.com/username/repo.git，留空跳过）'
if ($remoteUrl -and $remoteUrl.Trim() -ne '') {
    $existing = $null
    try { $existing = git remote get-url origin 2>$null } catch {}
    if ($existing) {
        Write-Host '更新远程 origin URL...' -ForegroundColor Yellow
        git remote set-url origin $remoteUrl
    } else {
        Write-Host '添加远程 origin...' -ForegroundColor Yellow
        git remote add origin $remoteUrl
    }
}

Write-Host '=== 设置完成 ===' -ForegroundColor Green
Write-Host '下一步示例命令：' -ForegroundColor Cyan
Write-Host '  git status' -ForegroundColor White
Write-Host '  git pull origin main' -ForegroundColor White
Write-Host '  git push origin main' -ForegroundColor White
