# 设置远端仓库

`.cursor` 目录的 Git 仓库已经初始化并创建了初始提交。现在需要设置远端仓库以便推送和同步。

## 步骤

### 1. 创建远端仓库

在 GitHub、GitLab 或其他 Git 托管平台创建一个新仓库，例如：
- `https://github.com/your-org/cursor-config.git`
- `https://gitlab.com/your-org/cursor-config.git`

### 2. 添加远端并推送

```bash
cd .cursor
git remote add origin <your-remote-repo-url>
git branch -M main
git push -u origin main
```

**示例：**
```bash
cd .cursor
git remote add origin https://github.com/your-org/cursor-config.git
git branch -M main
git push -u origin main
```

### 3. 验证

```bash
cd .cursor
git remote -v  # 应该显示远端仓库 URL
git status     # 应该显示 "Your branch is up to date with 'origin/main'"
```

## 注意事项

- 如果远端仓库已存在内容，可能需要先拉取：
  ```bash
  git pull origin main --allow-unrelated-histories
  git push -u origin main
  ```

- 如果使用 SSH 方式：
  ```bash
  git remote add origin git@github.com:your-org/cursor-config.git
  ```

## 完成后

设置完成后，可以：
- 在其他项目中克隆：`git clone <your-remote-repo-url> .cursor`
- 更新规则后推送：`git push`
- 在其他项目中同步：`git pull origin main`
