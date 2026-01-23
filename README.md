# Cursor 配置仓库

这是一个独立的 Git 仓库，包含 Cursor AI 的开发规则、技能（Skills）、待办清单（Todolist）和计划（Plans）。

## 📁 目录结构

```
.cursor/
├── skills/           # Cursor Skills（技能）
│   ├── todolist/    # 待办清单和易错清单
│   └── *.md         # 各种技能文档
├── plans/           # 项目计划和方案
├── review/          # 代码审查和知识库
└── agents.md        # Agent 配置
```

## 🚀 快速开始

### 在新项目中使用

**方式一：直接克隆（推荐）**

```bash
# 在项目根目录执行
git clone <cursor-repo-url> .cursor
```

**方式二：手动复制**

```bash
# 复制 .cursor 目录到新项目
cp -r <source-project>/.cursor <new-project>/.cursor

# 在新项目中重新设置远端（如果需要）
cd <new-project>/.cursor
git remote set-url origin <cursor-repo-url>
```

**方式三：使用脚本自动化**

```bash
# scripts/setup-cursor.sh
if [ ! -d .cursor ]; then
  git clone <cursor-repo-url> .cursor
fi
```

### 确保主项目不追踪 .cursor

确保主项目的 `.gitignore` 中包含：

```
.cursor
```

这样主项目就不会追踪 `.cursor` 目录，`.cursor` 可以独立管理。

## 📝 日常维护

### 更新规则

```bash
cd .cursor
git add .
git commit -m "Update: 描述你的更新内容"
git push
```

### 在其他项目中同步更新

```bash
cd .cursor
git pull origin main
```

### 查看提交历史

```bash
cd .cursor
git log --oneline
```

## 📚 可用 Skills

### 1. Plan模式测试报错分析 (`plan-test-analysis.md`)

结构化分析测试报错原因，生成修复方案（不改代码）。

**触发方式：**
- `@plan [错误信息]`
- `plan模式分析`
- `[PLAN]`

### 2. 生产环境风险检查 (`prod-risk-check.md`)

检查生产环境异常是否与循环依赖/初始化顺序有关。

**触发方式：**
- `@prod-risk [问题描述]`

### 3. DOM 工具函数检查 (`dom-utils-check.md`)

排查和改造 DOM 相关工具函数，处理位置越界、存储异常等问题。

**触发方式：**
- `@dom-utils-check [问题描述]`

### 4. 生成调试技能 (`gen-debugskills.md`)

将对话沉淀为 todolist + 易错清单 + skills。

**触发方式：**
- `@gen-skills [对话内容]`

## 📋 Todolist 清单

- **生产环境易错问题检查清单** - 按问题类型分组的检查清单
- **高风险问题-currentDepartment-循环依赖** - 循环依赖问题的详细说明
- **dom问题排查清单** - DOM 问题排查步骤
- **dom问题易错清单** - DOM 问题常见易错点

## 🔧 配置说明

### 独立 Git 仓库

`.cursor` 目录是一个独立的 Git 仓库，拥有自己的版本历史。这样做的好处：

- ✅ 可以在多个项目中复用同一套规则
- ✅ 独立版本管理，更新规则时不影响主项目
- ✅ 便于团队协作和规则同步

### 主项目配置

主项目的 `.gitignore` 中应包含 `.cursor`，确保主项目不会追踪 `.cursor` 目录。

## 🤝 团队协作

### 新成员设置

1. 克隆主项目
2. 初始化 `.cursor` 仓库：
   ```bash
   git clone <cursor-repo-url> .cursor
   ```

### 规则更新流程

1. 在 `.cursor` 目录中更新规则
2. 提交并推送到远端：
   ```bash
   cd .cursor
   git add .
   git commit -m "Update: 更新内容描述"
   git push
   ```
3. 通知团队成员同步更新：
   ```bash
   cd .cursor
   git pull origin main
   ```

## 📝 版本管理

建议使用语义化版本或日期标签管理规则更新：

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

## 🔗 相关资源

- **Skills 详细文档**：`skills/README.md`
- **项目计划**：`plans/`
- **代码审查记录**：`review/`

## 📞 反馈和建议

如果发现使用中的问题或有改进建议，请：

1. 在 `.cursor` 仓库中创建 Issue
2. 或直接修改对应的 skill 文件并提交 PR

---

**最后更新**：2024-01-XX
