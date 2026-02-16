# 从 Prototype 到 Develop 的增量开发工作流指南

## 📋 工作流概述

基于 **GitHub Flow** 和 **GitFlow** 的混合模式，适合从原型逐步开发到正式代码的场景。

## 🎯 核心原则

1. **prototype 分支**：保留作为参考原型（不直接合并）
2. **develop 分支**：主开发分支，保持稳定
3. **feature 分支**：从 develop 创建，每个功能模块一个分支
4. **增量提交**：每完成一个独立功能就提交推送

## 📝 详细操作步骤

### 第一步：确保 prototype 分支存在并已推送

```bash
# 如果还没有 prototype 分支，先创建并推送
git checkout -b prototype
# ... 在 prototype 上写 mock 数据和 API ...
git push origin prototype

# 如果已有 prototype 分支，确保是最新的
git checkout prototype
git pull origin prototype
```

### 第二步：切换到 develop 并创建 feature 分支

```bash
# 切换到 develop 分支
git checkout develop
git pull origin develop  # 确保是最新的

# 创建新的 feature 分支（命名规范：feature/功能名称）
git checkout -b feature/user-authentication
# 或者
git checkout -b feature/api-integration
```

### 第三步：参考 prototype 进行开发

```bash
# 方法1：查看 prototype 分支的特定文件
git show prototype:src/api/mockData.ts

# 方法2：在另一个终端窗口打开 prototype 分支作为参考
# 或者使用 IDE 的 Git 功能查看 prototype 分支的文件
```

### 第四步：逐步开发并提交

```bash
# 每完成一个独立功能就提交
git add src/api/auth.ts
git commit -m "feat: 实现用户认证功能"

# 立即推送到远程（备份 + 协作）
git push origin feature/user-authentication

# 继续开发下一个功能
git add src/api/dataValidation.ts
git commit -m "feat: 添加数据验证逻辑"
git push origin feature/user-authentication
```

### 第五步：完成功能后创建 Pull Request

```bash
# 确保所有更改都已推送
git push origin feature/user-authentication

# 然后在 GitLab/GitHub 上创建 Pull Request
# 将 feature/user-authentication 合并到 develop
```

### 第六步：合并后清理

```bash
# PR 合并后，删除本地 feature 分支
git checkout develop
git pull origin develop
git branch -d feature/user-authentication

# 删除远程分支（如果已合并）
git push origin --delete feature/user-authentication
```

## 🔄 工作流示例

假设你要开发一个用户管理系统：

```bash
# 1. 创建 feature 分支
git checkout develop
git checkout -b feature/user-management

# 2. 开发第一个功能：用户列表
# ... 参考 prototype 中的 mock 数据 ...
git add src/components/UserList.vue
git commit -m "feat: 实现用户列表组件"
git push origin feature/user-management

# 3. 开发第二个功能：用户详情
git add src/components/UserDetail.vue
git commit -m "feat: 实现用户详情页面"
git push origin feature/user-management

# 4. 开发第三个功能：API 集成
git add src/api/userApi.ts
git commit -m "feat: 集成用户管理 API"
git push origin feature/user-management

# 5. 创建 PR 并合并到 develop
```

## 💡 最佳实践

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `refactor:` - 重构代码
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `test:` - 测试相关
- `chore:` - 构建/工具相关

示例：
```bash
git commit -m "feat: 实现用户登录功能"
git commit -m "fix: 修复登录状态持久化问题"
git commit -m "refactor: 重构用户认证逻辑"
```

### 分支命名规范

- `feature/功能名称` - 功能开发
- `fix/问题描述` - Bug 修复
- `refactor/重构内容` - 代码重构

### 提交粒度

- ✅ **好的做法**：每个提交包含一个完整、独立的功能
- ❌ **避免**：一次提交包含多个不相关的更改

### 推送频率

- **建议**：每完成一个独立功能就推送一次
- **好处**：
  - 代码备份
  - 团队成员可以看到进度
  - 便于代码审查

## 🔍 常用命令速查

```bash
# 查看 prototype 分支的文件列表
git ls-tree -r --name-only prototype

# 对比 prototype 和当前分支的差异
git diff prototype..develop

# 查看 prototype 分支的某个文件
git show prototype:path/to/file

# 查看所有分支
git branch -a

# 查看提交历史
git log --oneline --graph --all
```

## ⚠️ 注意事项

1. **不要直接合并 prototype 到 develop**
   - prototype 包含 mock 数据和草稿代码
   - 应该在 feature 分支中重新实现正式代码

2. **保持 develop 分支稳定**
   - 只通过 Pull Request 合并
   - 合并前进行代码审查

3. **定期同步 develop**
   - 如果 develop 有更新，及时 rebase 或 merge
   ```bash
   git checkout feature/your-feature
   git rebase develop  # 或 git merge develop
   ```

## 📚 参考资源

- [GitHub Flow 文档](https://docs.github.com/zh/get-started/using-github/github-flow)
- [GitFlow 工作流](https://www.atlassian.com/zh/git/tutorials/comparing-workflows)
- [Conventional Commits](https://www.conventionalcommits.org/)
