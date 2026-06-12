# quick-mcp-deployer 经验

来源：龙虾项目 `automator/skills/quick-mcp-deployer/SKILL.md`

## 核心思路

接收一段用户需求描述的业务逻辑，自动将其封装为 MCP 工具并热加载到系统中。

## 流程

1. 解析用户需求的输入输出参数
2. 使用 FastMCP 框架编写接口代码
3. 自动生成项目的 `requirements.txt`
4. 在服务器上启动该 MCP 服务，返回 `mcp_url` 给总控

## 可借鉴到本套件的点

- ✅ 在 `策略-新建MCP-Server` 中加入"从需求描述直接生成"的模式
- ✅ 在 `生成启动脚本` 中自动生成 `requirements.txt`
- ✅ 考虑"热加载"模式：不停止已有 Server，动态注册新工具
