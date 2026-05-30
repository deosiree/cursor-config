# 探索-本地仓库 — 真实输出

**触发：** "探索 C:\Repertory\craft-agents-oss 的结构"  
**来源：** 对 craft-agents-oss 的实际 `directory_tree` + `read_file` 探索

---

```markdown
## craft-agents-oss — 本地探索结果

**路径：** C:\Users\huiyan\Documents\Repertory\craft-agents-oss
**项目类型：** Turborepo monorepo（Bun + TypeScript）

### 目录结构（depth=3 截断）
craft-agents-oss/
├── apps/
│   ├── cli/           ← WebSocket 命令行客户端（~10 文件）
│   ├── electron/      ← 桌面端（main + preload + renderer，~200 文件）
│   ├── webui/         ← Web 界面
│   └── viewer/        ← 会话分享查看器
├── packages/
│   ├── core/          ← 纯类型定义，零运行时依赖（~10 文件）
│   ├── shared/        ← 300+ 文件，核心业务逻辑集中地
│   ├── server-core/   ← RPC handlers + SessionManager + Transport
│   ├── pi-agent-server/  ← Pi AI 模型解析
│   ├── session-mcp-server/  ← 会话 MCP 服务
│   ├── session-tools-core/  ← 会话工具共享类型
│   └── ui/            ← 共享 React 组件库
├── bunfig.toml        ← Bun 包管理配置
├── package.json       ← workspace 配置
└── tsconfig.json      ← 根 TypeScript 配置

### 架构分层
1. 基础类型层（packages/core）→ 定义 Workspace/Session/Message/AgentEvent
2. 共享逻辑层（packages/shared）→ Agent/MCP/Session/Auth/Automations 等 15 个子目录
3. 服务端层（server-core/pi-agent-server/session-mcp-server）→ RPC + Transport
4. 应用入口层（apps/*）→ CLI/Electron/WebUI/Viewer 四种入口

### 关键设计决策
- Agent 后端抽象：AgentBackend 接口 + createAgent() 工厂 → Claude/Pi 即插即用
- MCP Client Pool：主进程管理连接，后端拿代理工具定义 → 跨 Session 共享
- Session JSONL 持久化：第 1 行 SessionHeader 预计算 → 列表加载只需读 1 行
```

**探索深度：** 3 层。**读取文件：** README.md、package.json、packages/core/src/types/index.ts、packages/shared/src/agent/backend/types.ts、packages/shared/src/mcp/mcp-pool.ts、packages/shared/src/sessions/types.ts。
