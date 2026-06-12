# Few-shot: 完整文件系统 + Obsidian 笔记检索 MCP Server

## 概述

这是本套件的核心 few-shot 案例，展示了从零创建 MCP Server 的完整实现。

## 项目信息

- **Server 名称**: Reasonix MCP Server
- **工具数量**: 12（6 文件系统 + 5 Obsidian 笔记 + 1 系统）
- **传输协议**: HTTP (streamable-http, stateless)
- **部署目标**: 本机 Windows
- **目标 Agent**: Reasonix / OpenCode / Hermes

## 文件说明

| 文件 | 用途 | 可借鉴点 |
|------|------|----------|
| `server.py` | MCP Server 主程序（18966 字节） | FastMCP 完整实现、安全沙箱、12 个工具 |
| `test_client.py` | 测试客户端 | HTTP 直连 MCP Server 的方式 |
| `.mcp.json` | Agent 配置文件 | HTTP 模式配置格式 |
| `start-mcp-server.bat` | 启动脚本 | Windows bat 模板（UTF-8 兼容） |

## 工具清单

### 文件系统（6 个）
- `read_file` / `write_file` / `append_file`
- `search_files` / `list_directory` / `get_file_info`

### Obsidian 笔记（5 个）
- `obsidian_list_notes` / `obsidian_search_by_tag`
- `obsidian_search_by_keyword` / `obsidian_read_note`
- `obsidian_get_structure`

### 系统（1 个）
- `get_server_info`

## 此案例展示的最佳实践

1. ✅ **安全沙箱**：路径白名单 + 文件大小限制
2. ✅ **HTTP 传输**：FastMCP 一行切换 transport
3. ✅ **Stateless 模式**：无需会话 ID，每次请求独立
4. ✅ **完整错误处理**：每个工具都有 try/except
5. ✅ **中文兼容**：代码注释全英文，工具描述全英文
6. ✅ **一键启动**：bat 脚本 + .mcp.json + test_client
