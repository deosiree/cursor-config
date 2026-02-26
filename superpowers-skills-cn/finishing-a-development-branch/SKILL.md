---
name: finishing-a-development-branch
description: 当实现完成、所有测试通过，你需要决定如何集成工作时使用 - 通过呈现合并、PR 或清理的结构化选项来指导开发工作的完成
---

# 完成开发分支

## 概述

通过呈现清晰的选项并处理所选工作流来指导开发工作的完成。

**核心原则：** 验证测试 → 呈现选项 → 执行选择 → 清理。

**开始时宣布：** "我正在使用 finishing-a-development-branch 技能来完成这项工作。"

## 流程

### 步骤 1：验证测试

**在呈现选项之前，验证测试通过：**

```bash
# 运行项目的测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
测试失败（<N> 个失败）。完成前必须修复：

[显示失败]

测试通过之前无法继续合并/PR。
```

停止。不要继续到步骤 2。

**如果测试通过：** 继续到步骤 2。

### 步骤 2：确定基础分支

```bash
# 尝试常见的基础分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或询问："此分支从 main 分离 - 是否正确？"

### 步骤 3：呈现选项

准确呈现这 4 个选项：

```
实现完成。你想做什么？

1. 本地合并回 <base-branch>
2. 推送并创建 Pull Request
3. 保持分支原样（我稍后处理）
4. 丢弃此工作

哪个选项？
```

**不要添加解释** - 保持选项简洁。

### 步骤 4：执行选择

#### 选项 1：本地合并

```bash
# 切换到基础分支
git checkout <base-branch>

# 拉取最新
git pull

# 合并功能分支
git merge <feature-branch>

# 验证合并结果的测试
<test command>

# 如果测试通过
git branch -d <feature-branch>
```

然后：清理工作树（步骤 5）

#### 选项 2：推送并创建 PR

```bash
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

然后：清理工作树（步骤 5）

#### 选项 3：保持原样

报告："保持分支 <name>。工作树保留在 <path>。"

**不要清理工作树。**

#### 选项 4：丢弃

**首先确认：**
```
这将永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- 工作树在 <path>

输入 'discard' 确认。
```

等待确切确认。

如果确认：
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

然后：清理工作树（步骤 5）

### 步骤 5：清理工作树

**对于选项 1、2、4：**

检查是否在工作树中：
```bash
git worktree list | grep $(git branch --show-current)
```

如果是：
```bash
git worktree remove <worktree-path>
```

**对于选项 3：** 保留工作树。

## 快速参考

| 选项 | 合并 | 推送 | 保留工作树 | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | ✓ | - | - | ✓ |
| 2. 创建 PR | - | ✓ | ✓ | - |
| 3. 保持原样 | - | - | ✓ | - |
| 4. 丢弃 | - | - | - | ✓ (强制) |

## 常见错误

**跳过测试验证**
- **问题：** 合并损坏的代码，创建失败的 PR
- **修复：** 在提供选项之前始终验证测试

**开放式问题**
- **问题：** "我应该做什么？" → 模糊
- **修复：** 准确呈现 4 个结构化选项

**自动工作树清理**
- **问题：** 在可能需要时删除工作树（选项 2、3）
- **修复：** 仅清理选项 1 和 4

**丢弃无确认**
- **问题：** 意外删除工作
- **修复：** 要求输入 "discard" 确认

## 危险信号

**绝不：**
- 在测试失败的情况下继续
- 不验证合并结果的测试就合并
- 不确认就删除工作
- 没有明确请求就强制推送

**总是：**
- 在提供选项之前验证测试
- 准确呈现 4 个选项
- 为选项 4 获取输入确认
- 仅清理选项 1 和 4 的工作树

## 集成

**由以下调用：**
- **subagent-driven-development**（步骤 7）- 所有任务完成后
- **executing-plans**（步骤 5）- 所有批次完成后

**与以下配对：**
- **using-git-worktrees** - 清理由该技能创建的工作树
