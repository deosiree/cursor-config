# 探索路由中心 — 说明文档

## 我该什么时候用？

当你需要了解一个外部项目或网站的内容——但你没有把它 clone 到本地，或者它是一个网站而非代码仓库。

## 三种探索模式

| 模式 | 什么时候用 | 怎么做 |
|------|-----------|--------|
| **本地仓库** | 项目已 clone 到本地 | `directory_tree` + `read_file` 逐步深入 |
| **GitHub 仓库** | 知道 owner/repo，没 clone | `raw.githubusercontent.com` 拉 README 和关键文件 |
| **网站** | 博客、文档站、非 GitHub URL | OpenCLI 做 JS 渲染抓取 |

## 网站探索（OpenCLI）

对于 SPA 网站（React/Vue/Next.js 渲染的），常规 `web_fetch` 只能拿到空壳 HTML。OpenCLI 可以执行 JavaScript 后再抓取：

```bash
npx opencli fetch https://example.com --render
```

如果 OpenCLI 不可用，回退到 `web_fetch` + `web_search` 组合。

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "探索 C:\\Repertory\\craft-agents-oss" | 本地路径 → directory_tree + read 关键文件 |
| "探索 Octane0411/the-claude-code" | owner/repo → raw.githubusercontent.com 拉 README |
| "看看 https://hello-agents.datawhale.cc" | HTTP URL → OpenCLI JS 渲染抓取 |
| "这个网站讲了什么？"（粘贴了 URL） | 走探索-网站策略（OpenCLI → web_fetch 回退 → web_search 回退） |

## 输出格式

探索完成后产出：
1. **结构树**：目录/页面结构
2. **关键文件/页面摘要**：README、入口文件、核心模块
3. **架构初步判断**：分层、模块边界、技术栈

## 相关

- 学习助手 skill：使用本路由中心探索项目源码
