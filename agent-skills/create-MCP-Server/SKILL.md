---
name: create-MCP-Server
description: 从需求分析到部署，创建完整的 MCP Server（FastMCP / HTTP / stdio），自动生成代码、配置、启动脚本，并注册到 Agent
---

# create-MCP-Server

从需求分析到部署，创建完整的 MCP Server，包含传输协议选择、工具封装、安全沙箱、启动脚本和 Agent 配置。

## 何时使用

- 需要新建一个 MCP Server（文件系统 / 数据库 / API 代理 / Obsidian 笔记等）
- 需要把一段业务逻辑封装为 MCP 工具供 AI Agent 调用
- 需要生成配套的启动脚本、Dockerfile、.mcp.json 配置
- 需要将 MCP Server 注册到 Reasonix / OpenCode / Hermes / Claude Code

## 何时不要使用

- 只是修改现有 MCP Server 的某个工具，不涉及新建
- 只是启动/停止已有的 MCP Server（直接用 bat/sh 即可）
- 不需要 MCP 协议，只是写普通 Web API

## 输入契约

提供以下信息以得到最优结果：

- `targetPath`: MCP Server 的目标目录（必填）
- `toolList`: 需要哪些工具（如 "文件读写"、"Obsidian 笔记检索"、"数据库查询"）
- `transport`: 传输协议偏好（http / stdio / sse，不填则按场景推荐）
- `securityPolicy`: 安全限制（路径白名单、文件大小限制、权限控制）
- `deployTarget`: 部署目标（本机运行 / Docker / 远程主机）
- `agentType`: 目标 Agent（Reasonix / OpenCode / Hermes / Claude Code）

## 核心流程

### RED（现状分析）

1. 明确用户需要哪些工具（文件操作、数据库、API、笔记检索等）
2. 判断传输协议场景：本地 Agent 走 stdio，远程访问走 HTTP
3. 评估安全边界：哪些路径/资源需要保护
4. 检查环境：Python + fastmcp 是否已安装

### GREEN（新建）

1. 路由到 `[[intention-skills/分析-需求理解/SKILL.md]]` — 解析需求，输出工具列表和 Schema
2. 路由到 `[[intention-skills/策略-选择传输协议/SKILL.md]]` — 确定 http / stdio / sse
3. 路由到 `[[intention-skills/策略-新建MCP-Server/SKILL.md]]` — 生成完整 Server 代码
4. 依次执行功能层子 skill：
   - `[[feature-skills/封装FastMCP工具/SKILL.md]]` — 将函数装帧为 @tool
   - `[[feature-skills/配置安全沙箱/SKILL.md]]` — 路径白名单、大小限制
   - `[[feature-skills/生成启动脚本/SKILL.md]]` — bat / sh / Dockerfile
   - `[[feature-skills/生成mcp配置/SKILL.md]]` — .mcp.json
   - `[[feature-skills/注册到Agent/SKILL.md]]` — Reasonix / Hermes 配置说明

### REFACTOR（迭代优化）

- 工具 Schema 不全或过粗 → 补充入参描述
- 缺少错误处理 → 统一错误消息格式
- 安全不够 → 收紧白名单 / 增加文件类型过滤
- 启动脚本不可用 → 补充环境检测和中文路径处理

## 人工门禁

以下情况必须先停下来确认：

- 同时混入修改业务代码和创建 MCP Server 两个需求
- targetPath 已存在同名 Server，需要确认是覆盖还是新建
- 工具涉及数据库操作，需要确认 SQL 安全策略
- 远程部署需要防火墙配置，人工确认端口是否可用

## 输出契约

每轮至少输出：

- `toolList`: 最终确定的工具列表
- `transport`: 选择的传输协议
- `serverCode`: 生成的 Server 代码路径
- `configFiles`: 生成的配置文件列表（.mcp.json、bat/sh、Dockerfile）
- `registrationGuide`: 注册到 Agent 的操作说明

## 快速魔改模板

提供一个可直接修改的完整 MCP Server 项目供快速二次开发：

`[[template/reasonix-mcp-server-few-shot/]]`

包含 12 个工具（6 文件系统 + 5 Obsidian 笔记 + 1 系统），HTTP 传输，
路径白名单、安全沙箱、启动脚本、测试客户端、README 全部就位。

**使用方式**：复制整个目录 → 修改 server.py 中的工具函数和配置 → 改名为你的项目 → 启动。

---

## 使用示例

```text
使用 create-MCP-Server 在 F:\Projects\my-mcp 创建一个文件系统 MCP Server，
提供 read_file / write_file / search_files 三个工具，
使用 HTTP 传输，路径白名单限制在 F:\Projects 下，
部署到本机运行，注册到 Reasonix。
```

## 参考

- `[[template/reasonix-mcp-server-few-shot/]]` — 可魔改的完整 MCP Server
- `[[references/FastMCP vs 原生MCP-SDK对比.md]]`
- `[[references/HTTP传输模式解读.md]]`
- `[[references/MCP是什么.md]]`
- `[[references/Hermes+迷你主机搭建教程.md]]`
- `[[references/mcp-forge经验.md]]`
- `[[references/quick-mcp-deployer经验.md]]`
- `[[assets/skill-output-checklist.md]]`
