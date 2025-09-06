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

<<<<<<< HEAD
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
=======
# 规范化当前分支名
$currentBranch = $currentBranch.Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Host "检测不到当前分支，默认使用 'main'" -ForegroundColor Yellow
    $currentBranch = "main"
}

# 检查远程 origin
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $remoteUrl) {
        throw "未配置远程 origin。请运行 .\setup-git.ps1 或手动添加远程。"
    }
    Write-Host "远程 origin: $remoteUrl" -ForegroundColor Cyan
} catch {
    Write-Host "✗ $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 如果使用 SSH，则确保 ssh-agent 在运行并尝试添加常见私钥
if ($remoteUrl -match "git@github.com:") {
    Write-Host "使用 SSH 方式连接 GitHub，检查 ssh-agent..." -ForegroundColor Cyan
    $svc = Get-Service -Name ssh-agent -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -ne 'Running') {
        Write-Host "启动 ssh-agent 服务..." -ForegroundColor Yellow
        try { Start-Service ssh-agent -ErrorAction Stop } catch { }
    }

    # 列出当前 identities（若无则尝试添加常见路径的密钥）
    ssh-add -l 2>$null
    if ($LASTEXITCODE -ne 0) {
        $candidates = @("$env:USERPROFILE\.ssh\id_ed25519", "$env:USERPROFILE\.ssh\id_rsa", "C:\\Users\\Administrator\\.ssh\\id_ed25519_github")
        foreach ($k in $candidates) {
            if (Test-Path $k) {
                Write-Host "添加 SSH 私钥：$k" -ForegroundColor Yellow
                ssh-add $k 2>&1 | ForEach-Object { Write-Host $_ }
            }
        }
    }

    # 再次列出 identities 以便用户确认
    ssh-add -l 2>$null
}

# 执行 fetch 与 pull，并对错误进行检查
try {
    git fetch origin --prune
    if ($LASTEXITCODE -ne 0) { throw "git fetch 失败" }

    # 检查远程是否存在当前分支
    git rev-parse --verify origin/$currentBranch > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "远程上不存在分支 '$currentBranch'，尝试回退到远程默认分支..." -ForegroundColor Yellow
        $remoteDefault = $null
        git branch -r | Select-String -Pattern 'origin/(main|master)' | ForEach-Object {
            if ($_.ToString() -match 'origin/(main|master)') { $remoteDefault = $Matches[1] }
        }
        if ($remoteDefault) {
            Write-Host "使用远程分支：$remoteDefault" -ForegroundColor Cyan
            $currentBranch = $remoteDefault
        } else {
            throw "未找到可用的远程分支"
        }
    }

    git pull origin $currentBranch
    if ($LASTEXITCODE -ne 0) { throw "git pull 失败，可能存在冲突或认证问题" }

    Write-Host "✓ 成功拉取最新版本" -ForegroundColor Green
    Write-Host "`n最近的提交记录：" -ForegroundColor Cyan
    git log --oneline -5
} catch {
    Write-Host "✗ 拉取失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查网络、远程地址、SSH 密钥或凭证，并重试。" -ForegroundColor Yellow
    exit 1
>>>>>>> 1505a9fb516a576df36bde8a01a9c11454e56bb3
}

Write-Host "`n完成！" -ForegroundColor Green
