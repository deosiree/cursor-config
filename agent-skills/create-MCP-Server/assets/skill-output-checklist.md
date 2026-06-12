# Skill 交付检查清单

在完成 MCP Server 创建后，逐项确认。

## 代码质量

- [ ] server.py 语法无错误（`python -c "import py_compile; py_compile.compile('server.py')"`）
- [ ] 所有函数有类型注解
- [ ] 所有 @tool 有完整 docstring
- [ ] 所有参数有 description（Agent 靠它理解含义）
- [ ] 所有错误被 try/except 捕获，返回友好错误消息

## 安全

- [ ] 路径操作有白名单检查（is_path_allowed）
- [ ] 文件大小限制（MAX_FILE_SIZE）
- [ ] 数据库操作仅允许 SELECT
- [ ] Shell 执行过滤高危命令

## 配置

- [ ] `.mcp.json` 语法正确
- [ ] `requirements.txt` 包含所有依赖
- [ ] 启动脚本（bat/sh）可运行
- [ ] 端口不与现有服务冲突

## 测试

- [ ] Server 能启动（无 import 错误）
- [ ] `tools/list` 返回所有工具
- [ ] 至少一个工具调用成功
- [ ] 错误路径（文件不存在、越权）返回正确错误消息

## 文档

- [ ] README.md 写清启动方式和工具列表
- [ ] Agent 注册方式说明完整
