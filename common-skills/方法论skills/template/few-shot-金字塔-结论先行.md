# 金字塔 · 结论先行 — 真实输出

**触发：** "概述 Agent 系统的 7 层技术栈学习路径"  
**来源：** 对 `Agent开发学习路线` 第 4 节"技术栈按层理解"的真实回答

---

**塔尖（一句话结论）：** 每层只依赖它下面的层。改 UI 不影响 Agent Loop，换模型不影响 MCP 工具池。

**第二层（支撑论据）：**

```
Day 1-2：运行时 + 传输层（地基）
  → 理解 Bun/TS 工程化 + JSONL 持久化格式

Day 3-4：Agent 后端 + 工具协议（核心）
  → 理解 AgentBackend 接口 + Agent Loop 12 步 + MCP Pool 路由

Day 5-6：UI + 桌面端（外壳）
  → 理解 Electron 三进程架构 + React 流式渲染

Day 7：校验与观测（保险网）
  → 理解 Zod Schema + Sentry 集成 + 结构化日志
```

**第三层（与后文呼应）：**

| 层级 | 技术 | 解决什么问题 |
|------|------|-------------|
| 运行时 | Bun / TypeScript | 代码怎么写、怎么跑 |
| 桌面端 | Electron / esbuild | 怎么访问本地文件系统和 Shell |
| UI层 | React / Tailwind / Jotai / Radix | 用户看到什么、怎么交互 |
| Agent后端 | Claude Agent SDK / Pi Coding Agent | Agent 的"大脑"怎么运行 |
| 工具协议 | MCP | 外部工具怎么接入 |
| 传输层 | JSONL / WebSocket / RPC | 数据怎么存、怎么传 |
| 校验与观测 | Zod / Sentry / 日志 | 怎么知道系统在正常工作 |

**金字塔检验（写后自检）：**
- ✅ 塔尖可验证（"改 UI 不影响 Agent Loop"——这是 craft-agents-oss 的实际架构约束）
- ✅ 支撑论据 2 层（学习路径 + 对比表）
- ✅ 不在细节对比段用金字塔
