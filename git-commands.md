# Git 常用命令快速参考

## 基本设置
```powershell
# 设置用户信息
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"

# 查看配置
git config --list
```

## 仓库操作
```powershell
# 初始化仓库
git init

# 克隆远程仓库
git clone https://github.com/username/repository.git

# 添加远程仓库
git remote add origin https://github.com/username/repository.git

# 查看远程仓库
git remote -v
```

## 日常操作
```powershell
# 查看状态
git status

# 添加文件
git add .                    # 添加所有文件
git add filename.txt         # 添加指定文件

# 提交更改
git commit -m "提交说明"

# 推送到远程仓库
git push origin main         # 推送到main分支
git push origin develop      # 推送到develop分支

# 拉取最新版本
git pull origin main         # 从main分支拉取
git fetch origin             # 只获取更新，不合并
```

## 分支操作
```powershell
# 查看分支
git branch                   # 查看本地分支
git branch -r                # 查看远程分支
git branch -a                # 查看所有分支

# 创建分支
git branch new-feature       # 创建新分支
git checkout -b new-feature  # 创建并切换到新分支

# 切换分支
git checkout main            # 切换到main分支
git checkout develop         # 切换到develop分支

# 合并分支
git merge feature-branch     # 合并指定分支到当前分支

# 删除分支
git branch -d feature-branch # 删除本地分支
```

## 查看历史
```powershell
# 查看提交历史
git log                      # 详细历史
git log --oneline            # 简洁历史
git log --graph              # 图形化历史

# 查看文件变化
git diff                     # 查看未暂存的更改
git diff --staged            # 查看已暂存的更改
```

## 撤销操作
```powershell
# 撤销工作区更改
git checkout -- filename.txt

# 撤销暂存区更改
git reset HEAD filename.txt

# 撤销提交
git reset --soft HEAD~1      # 撤销最后一次提交，保留更改
git reset --hard HEAD~1      # 撤销最后一次提交，删除更改
```

## 常见问题解决

### 1. 拉取时出现冲突
```powershell
# 手动解决冲突后
git add .
git commit -m "解决冲突"
```

### 2. 强制推送（谨慎使用）
```powershell
git push --force origin main
```

### 3. 忽略已跟踪的文件
```powershell
git rm --cached filename.txt
# 然后将文件添加到 .gitignore
```

## 自动化脚本
- `.\setup-git.ps1` - 初始化Git仓库
- `.\pull-latest.ps1` - 拉取最新版本
- `.\push-code.ps1` - 推送代码
