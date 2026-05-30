# Mermaid flowchart TD — 真实输出

**触发：** "画 7 层技术栈的分层架构图"  
**来源：** 对 `Agent开发学习路线` 第 4 节的真实回答

````mermaid
flowchart TD
    subgraph Top[用户可见]
        UI[UI 层<br/>React · Tailwind · Jotai · Radix]
        DESKTOP[桌面端层<br/>Electron · esbuild]
    end

    subgraph Middle[Agent 核心]
        AGENT[Agent 后端层<br/>Claude Agent SDK · Pi Coding Agent]
        TOOLS[工具协议层<br/>MCP · Skill · Session Tools]
    end

    subgraph Bottom[基础设施]
        RUNTIME[运行时层<br/>Bun · TypeScript]
        TRANSPORT[传输层<br/>JSONL · WebSocket · RPC]
        OBSERVE[校验与观测层<br/>Zod · Sentry · 日志]
    end

    UI --> AGENT
    DESKTOP --> AGENT
    AGENT --> TOOLS
    TOOLS --> TRANSPORT
    TRANSPORT --> RUNTIME
    OBSERVE -.-> AGENT
    OBSERVE -.-> TRANSPORT

    style Top fill:#e3f2fd,stroke:#1565c0
    style Middle fill:#fff3e0,stroke:#e65100
    style Bottom fill:#e8f5e9,stroke:#2e7d32
```
````

**窄版规则验证：**
- ✅ flowchart TD（竖排优先）
- ✅ 节点文字 ≤ 15 中文字（最长"校验与观测层"=5 字）
- ✅ subgraph 标签 ≤ 10 字（"用户可见"/"Agent 核心"/"基础设施"）
- ✅ 同级分支 ≤ 4 个（最多 3 层 subgraph）

````