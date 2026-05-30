# 探索-网站 — 真实输出

**触发：** "看看 https://hello-agents.datawhale.cc 讲了什么"  
**来源：** 对 hello-agents.datawhale.cc 的实际 OpenCLI JS 渲染 + web_fetch 回退备选链路

---

## 探索链路

### 主策略：OpenCLI JS 渲染抓取

```bash
npx opencli fetch https://hello-agents.datawhale.cc --render --wait-for="article,.content,main,h1" --timeout=15
```

**输出摘要：**
```
返回状态: 200 OK
渲染后页面内容（截取）:

# Hello Agents

欢迎来到 AI Agent 的世界！本网站是一份面向开发者的 AI Agent 入门教程。

## 目录
1. 什么是 AI Agent
2. Agent 的核心能力
3. 工具调用（Tool Calling）
4. 记忆系统（Memory）
5. 规划能力（Planning）
6. 多 Agent 协作（Multi-Agent）
7. 实战：构建你的第一个 Agent

## 章节概览
- **什么是 AI Agent**：Agent = LLM + 记忆 + 工具 + 规划。
  对比传统程序 vs Agent 程序，解释各组件职责。
- **工具调用**：Function Calling 原理、OpenAI/Fireworks 格式差异、
  Parallel Tool Calling 执行模型。
- **记忆系统**：短期记忆（上下文窗口）、长期记忆（RAG/外部存储）、
  多 Agent 记忆共享方案对比。
- **规划能力**：ReAct、Plan-and-Execute、Tree-of-Thought 模式对比。
- **多 Agent 协作**：Orchestrator-Worker、Debate、Tool 共享模式。
```

### 回退 1：web_fetch 拿骨架（当 OpenCLI 不可用时）

```typescript
// 用 web_fetch 抓取 HTML，提取结构化信息
const html = await web_fetch("https://hello-agents.datawhale.cc");
```

**提取的结构化信息：**
- `<title>`：Hello Agents — AI Agent 入门教程
- `<meta description>`：面向开发者的 AI Agent 系统教程，从原理到实践
- `<h1>`：Hello Agents
- `<h2>`：什么是 AI Agent / Agent 的核心能力 / 工具调用 / 记忆系统 / 规划能力 / 多 Agent 协作 / 实战

### 回退 2：web_search 补充（当前两个都不可用时）

```bash
web_search("hello-agents.datawhale.cc 介绍")
web_search("Datawhale AI Agent 教程")
```

**搜索结果摘要：**
- Datawhale 开源项目：面向开发者的 AI Agent 入门教程
- 内容涵盖 Agent 基础概念到大模型工具调用实战
- GitHub 同步更新，支持社区贡献

---

```markdown
## hello-agents.datawhale.cc — 网站探索结果

**来源：** https://hello-agents.datawhale.cc
**抓取方式：** OpenCLI JS 渲染（主策略）
**抓取时间：** 2025-01-xx

### 网站结构
- `/` → 首页教程目录：7 章从 Agent 基础到实战
- 导航章节结构清晰，每章有理论说明 + 代码示例链接

### 关键内容摘要
**项目定位：** 面向开发者的 AI Agent 入门教程网站
**核心观点：** Agent = LLM + 记忆 + 工具 + 规划
**覆盖章节：**
1. 什么是 AI Agent — 定义 + 与传统程序对比
2. Agent 核心能力 — 工具调用、记忆、规划、多 Agent
3. 工具调用 — Function Calling 原理、多工具并行调用
4. 记忆系统 — 短期 vs 长期记忆、RAG 方案对比
5. 规划能力 — ReAct / Plan-and-Execute / ToT
6. 多 Agent 协作 — Orchestrator / Debate / Tool 共享
7. 实战构建 — 从零搭建一个 Agent 系统

### 与当前任务的相关性
该教程网站与 Agent 架构学习高度相关，可作为"什么是 AI Agent"章节的参考资料来源。内容偏入门，适合新手快速建立 Agent 概念体系。
```

**探索深度：** 单页入口 + 导航结构。  
**回退触发条件：** OpenCLI 不可用 → web_fetch 骨架提取（回退 1）→ web_search 语义补充（回退 2）。
