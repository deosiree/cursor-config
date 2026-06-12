---
name: 分析-需求理解
description: 解析用户需求，输出 MCP 工具列表、参数 Schema 和安全边界
---

# 分析-需求理解

## 职责

把用户的自然语言需求转化为结构化的 MCP 工具定义。

## 输入

- `toolList`（用户原始需求描述）
- `targetPath`（Server 目标目录）

## 输出

- `parsedTools`: 工具列表，每项包含 name / description / inputSchema / 实现函数
- `securityHints`: 安全建议（路径白名单、SQL 只读、文件大小限制等）
- `dependencies`: 需要 pip install 的依赖

## 工具分类范式

| 类别 | 典型工具 | 框架推荐 |
|------|----------|----------|
| 文件系统 | read_file, write_file, search_files | FastMCP |
| 笔记检索 | obsidian_list_notes, obsidian_search_by_tag | FastMCP |
| 数据库 | query_database, execute_sql | FastMCP |
| API 代理 | call_api, transform_data | FastMCP |
| 系统监控 | get_cpu, get_memory, get_disk | FastMCP |
| Shell 执行 | run_command | FastMCP（需严格沙箱）|

## 参数 Schema 规则

- 使用 JSON Schema 标准（FastMCP 自动从 Python 类型注解推断）
- 必填参数标注 `required`
- 每个参数必须有 `description`（MCP Client 靠它理解参数含义）
- 复杂结构用 Pydantic BaseModel 定义

## 安全边界判断

- 文件操作：必须限制白名单目录
- 数据库操作：仅允许 SELECT，禁止 DDL/DML
- Shell 执行：禁止 rm/del/format 等高危命令
- 网络请求：限制目标域名白名单
