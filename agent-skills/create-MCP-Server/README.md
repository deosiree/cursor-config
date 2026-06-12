# create-MCP-Server 套件

从需求分析到部署，创建完整的 MCP Server，包含传输协议选择、工具封装、安全沙箱、启动脚本和 Agent 配置。

## 结构

```
create-MCP-Server/
├── SKILL.md                    # 父级 agent skill — 路由 + 门禁 + 主流程
├── README.md                   # 本文件
├── intention-skills/           # 意图层：判断"做什么"
│   ├── 分析-需求理解/          # 解析用户需求 → 工具列表 + Schema
│   ├── 策略-选择传输协议/       # 决定 http / stdio / sse
│   └── 策略-新建MCP-Server/    # 生成完整 Server 代码
├── feature-skills/             # 功能层：判断"怎么做"
│   ├── 封装FastMCP工具/        # 将函数装帧为 @tool
│   ├── 配置安全沙箱/           # 路径白名单、大小限制、权限
│   ├── 生成启动脚本/           # bat / sh / Dockerfile
│   ├── 生成mcp配置/            # .mcp.json
│   └── 注册到Agent/            # Reasonix / Hermes 配置说明
├── references/                 # 参考文档
├── template/                   # 代码模板
├── assets/                     # few-shot 资产
└── evals/                      # 质量评估
```

## 设计思路

| 层 | 职责 | 典型判断 |
|----|------|----------|
| **父级 SKILL** | 路由 + 门禁 + 流程编排 | 应该新建还是升级？走哪个子 skill？ |
| **意图层** | 分析需求，做出决策 | 传输协议选 HTTP 还是 stdio？工具有哪些？ |
| **功能层** | 执行具体任务 | 怎么生成 @tool 代码？怎么写安全沙箱？|

## 对比同类 skill

| skill | 定位 |
|-------|------|
| `mcp-forge` | 龙虾项目：技能升舱为 MCP 服务 |
| `quick-mcp-deployer` | 龙虾项目：快速封装并热加载 |
| **`create-MCP-Server`** | 本套件：从需求到部署一站式创建 |

本套件吸收了上述两份 skill 的经验（健康检查、Dockerfile、热加载），
并将本次 Reasonix MCP Server（文件系统 + Obsidian 笔记检索）的完整实现作为 few-shot。

## 使用方式

在 Reasonix 中调用：

```
使用 create-MCP-Server 在 F:\Projects\my-server 创建一个 MCP Server，
提供 Obsidian 笔记检索功能，HTTP 传输，注册到 Reasonix。
```

## 参考

- `references/MCP是什么.md` — MCP 协议基础概念
- `references/Hermes+迷你主机搭建教程.md` — Hermes 集成教程
- `references/FastMCP vs 原生MCP-SDK对比.md` — 框架选型参考
- `references/mcp-forge经验.md` — 健康检查、Dockerfile 生成
- `references/quick-mcp-deployer经验.md` — 快速封装与热加载
- `assets/few-shot-完整文件系统+Obsidian笔记服务器/` — 本次实战完整代码
