---
name: 策略-新建MCP-Server
description: 根据需求分析和协议选择结果，生成完整的 MCP Server 代码和配置文件
---

# 策略-新建MCP-Server

## 职责

在前两个意图子 skill 产出基础上，组装完整 MCP Server，路由到各功能层子 skill 执行具体生成。

## 流程

1. 接收 `分析-需求理解` 的 `parsedTools` 和 `securityHints`
2. 接收 `策略-选择传输协议` 的协议选择
3. 选择代码模板（FastMCP / FastAPI 原生 MCP）
4. 路由到功能层生成各部分：
   - `[[feature-skills/封装FastMCP工具/SKILL.md]]`
   - `[[feature-skills/配置安全沙箱/SKILL.md]]`
   - `[[feature-skills/生成启动脚本/SKILL.md]]`
   - `[[feature-skills/生成mcp配置/SKILL.md]]`
   - `[[feature-skills/注册到Agent/SKILL.md]]`
5. 写入目标目录，输出总结

## 框架选择

| 条件 | 推荐框架 | 原因 |
|------|----------|------|
| 工具数 ≤ 5，简单场景 | FastMCP | 一行 `@mcp.tool()` 搞定 |
| 工具数 > 5，需要组织 | FastMCP | 分层管理，HTTP 原生支持 |
| 需要精细控制 HTTP 端点 | 原生 MCP SDK | 自定义路由和中间件 |
| 已有 FastAPI 项目 | FastAPI + MCP 端点 | 复用现有架构 |

## 输出

- `server.py`: 完整的 Server 代码
- `test_client.py`: 测试客户端
- 启动脚本
- `.mcp.json`: Agent 配置
- `README.md`: 使用说明
