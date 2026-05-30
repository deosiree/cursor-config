# 探索-GitHub仓库 策略

> 当用户只给了 `owner/repo`，未 clone 到本地时使用。

## 探索步骤

### 1. 抓取 README

首选尝试获取默认分支名（避免只试 main/master 漏掉其他分支名）：
```
web_fetch: https://api.github.com/repos/{owner}/{repo}
→ 从 JSON 响应中提取 .default_branch 值
```
**注意：** GitHub API 有匿名限流（~60 req/h），如果返回 403 则跳过此步直接回退。

如果 API 不可用，按顺序尝试：
```
web_fetch: https://raw.githubusercontent.com/{owner}/{repo}/main/README.md
```
回退：`web_fetch: https://raw.githubusercontent.com/{owner}/{repo}/master/README.md`

**边界：**
- 如果两次 raw 都返回 404/403 → 提示"**可能是私有仓库或仓库名/分支名错误**"，建议用户确认仓库是否公开或自行 clone
- 如果仓库名看起来像内部项目（如 `company-internal/tool`），优先提示用户确认后再探索

### 2. 从 README 推断结构

按以下优先级解析 README（用 `search_content` 或正则扫描）：

**章节标题关键词（按匹配优先级）：**
1. `## Structure` / `## 目录结构` / `## Project Structure` → 直接提取目录树
2. `## Architecture` / `## 架构` → 提取分层和模块边界
3. `## Packages` / `## Modules` / `## 模块` → 提取子包列表
4. `## Features` / `## 功能特性` → 提取能力清单
5. `## Tech Stack` / `## 技术栈` → 提取运行时和框架

**技术栈推断规则：**
- `package.json` 中 `dependencies` → 框架（React/Vue/Express）
- `devDependencies` → 构建工具（Vite/Webpack）
- `workspaces` 或 `packages` 字段 → monorepo 结构
- `engines.node` → Node 版本要求

**文档链接推断：**
- README 中的 `https://` 链接 → 文档站 / API 参考 / 示例
- 链接路径含 `/docs/` `/api/` `/examples/` → 对应分类
- 链接到 `github.com/{owner}/{repo}/wiki` → Wiki 文档

### 3. 按需深入

根据调用方关注点，尝试拉取关键文件：
- `raw.githubusercontent.com/{owner}/{repo}/main/package.json`
- `raw.githubusercontent.com/{owner}/{repo}/main/src/index.ts`

### 4. 不做什么

- 不爬 DeepWiki（SPA 无法抓取）
- 不逐个文件遍历（API 限流）
- 不 clone 整个仓库（用户自行决定是否 clone）

### 5. 输出

```markdown
## {owner/repo} — GitHub 探索结果

**来源：** https://github.com/{owner}/{repo}
**抓取方式：** raw.githubusercontent.com

### 项目简介
{README 摘要}

### 推断的技术栈
- 运行时：{从 package.json 推断}
- 框架：{从依赖推断}

### 模块划分（从 README 推断）
{目录结构}

### 局限性
⚠️ GitHub 远程探索无法获取完整源码细节。如需深入分析，建议 clone 到本地并使用"探索-本地仓库"策略。
```
