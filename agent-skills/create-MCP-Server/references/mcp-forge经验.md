# mcp-forge 经验

来源：龙虾项目 `automator/skills/mcp-forge/SKILL.md`

## 核心思路

当 Skill 复杂度超过阈值或需要多 Agent 共享状态时，将 Skill 升舱为 MCP 服务。

## 触发条件（升舱评估）

满足以下之一：
- 需要管理数据库连接
- 需要持续运行的服务
- 需要跨 Agent（前端/后端）调用

## 沉淀规则

1. **框架选择**：Python 用 `fastmcp`，Go 用 `mcp-golang`
2. **Schema 定义**：基于 Zod（TS）或 Pydantic（Python）定义清晰入参
3. **部署脚本**：
   - 自动生成 `Dockerfile` 和 `requirements.txt`
   - 提供一键启动脚本 `start_mcp.sh`
4. **文档同步**：自动生成 MCP 工具使用说明，更新总控的工具索引
5. **健康检查**：必须包含健康检查端点

## 可借鉴到本套件的点

- ✅ 在 `生成启动脚本` 中加入 Dockerfile 生成能力
- ✅ 在父级 SKILL.md 中加入健康检查要求
- ✅ 参考其"升舱评估"逻辑完善 `分析-需求理解` 的触发条件判断
