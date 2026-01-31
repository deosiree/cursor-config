---
name: finishing-a-development-branch
description: 当实施完成，所有测试通过，你需要决定如何集成工作时使用——通过提供结构化的合并、PR 或清理选项来指导开发工作的完成
---

# 完成开发分支 (Finishing a Development Branch)

## 概览

通过提供清晰的选项并处理所选的工作流来指导开发工作的完成。

**核心原则：** 验证测试 → 展示选项 → 执行选择 → 清理。

**开始时声明：** “我正在使用 finishing-a-development-branch 技能来完成这项工作。”

## 流程

### 第 1 步：验证测试

**在展示选项之前，验证测试是否通过：**

```bash
# 运行项目的测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**

```
测试失败（<N> 个失败）。完成前必须修复：

[展示失败]

在测试通过前无法继续合并/PR。
```

停止。不要进行第 2 步。

**如果测试通过：** 继续第 2 步。

### 第 2 步：确定基础分支

```
# 尝试常见的基础分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者询问：“这个分支是从 main 分离出来的——对吗？”

### 第 3 步：展示选项

准确展示这 4 个选项：

```
实施完成。你想做什么？

1. 在本地合并回 <base-branch>
2. 推送并创建 Pull Request
3. 保持分支原样（我稍后处理）
4. 丢弃此工作

选择哪个选项？
```

**不要添加解释** - 保持选项简洁。

### 第 4 步：执行选择

#### 选项 1：本地合并

```
# 切换到基础分支
git checkout <base-branch>

# 拉取最新代码
git pull

# 合并功能分支
git merge <feature-branch>

# 在合并结果上验证测试
<test command>

# 如果测试通过
git branch -d <feature-branch>
```

然后：清理工作树（第 5 步）

#### 选项 2：推送并创建 PR

```
# 推送分支
git push -u origin <feature-branch>

# 创建 PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

然后：清理工作树（第 5 步）

#### 选项 3：保持原样

报告：“保留分支 <name>。工作树保留在 <path>。”

**不要清理工作树。**

#### 选项 4：丢弃

**首先确认：**

```
这将永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- 位于 <path> 的工作树

输入 'discard' 确认。
```

等待准确的确认。

如果确认：

Bash

```
git checkout <base-branch>
git branch -D <feature-branch>
```

然后：清理工作树（第 5 步）

### 第 5 步：清理工作树

**对于选项 1, 2, 4:**

检查是否在工作树中：

Bash

```
git worktree list | grep $(git branch --show-current)
```

如果是：

Bash

```
git worktree remove <worktree-path>
```

**对于选项 3:** 保留工作树。

## 快速参考

| **选项**    | **合并** | **推送** | **保留工作树** | **清理分支** |
| ----------- | -------- | -------- | -------------- | ------------ |
| 1. 本地合并 | ✓        | -        | -              | ✓            |
| 2. 创建 PR  | -        | ✓        | ✓              | -            |
| 3. 保持原样 | -        | -        | ✓              | -            |
| 4. 丢弃     | -        | -        | -              | ✓ (强制)     |

## 常见错误

**跳过测试验证**

- **问题：** 合并损坏的代码，创建失败的 PR
- **修复：** 在提供选项前始终验证测试

**开放式问题**

- **问题：** “我接下来该做什么？” → 模棱两可
- **修复：** 展示准确的 4 个结构化选项

**自动清理工作树**

- **问题：** 当可能需要时移除了工作树（选项 2, 3）
- **修复：** 仅在选项 1 和 4 时清理

**丢弃无确认**

- **问题：** 意外删除工作
- **修复：** 要求输入 "discard" 确认

## 红灯警示

**绝不：**

- 在测试失败时继续
- 在未验证结果测试的情况下合并
- 未经确认删除工作
- 未经明确要求强制推送

**总是：**

- 在提供选项前验证测试
- 展示准确的 4 个选项
- 获取选项 4 的输入确认
- 仅为选项 1 & 4 清理工作树

## 集成

**调用者：**

- **subagent-driven-development** (第 7 步) - 在所有任务完成后
- **executing-plans** (第 5 步) - 在所有批次完成后

**搭配使用：**

- **using-git-worktrees** - 清理该技能创建的工作树