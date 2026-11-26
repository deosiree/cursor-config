# muti-agents

面向研发阶段的多 Agent 角色协作与委派 Skill。它负责识别当前宿主、确认能力、选择已登记方案、在人工授权后派发任务并核对结果。

## 跨机器安装

1. **同步来源仓库**：克隆或同步本仓库，确认 agent-skills/muti-agents/ 内包含主文档、子 Skill、assets/、scripts/ 和 references/。更新时从仓库同步，避免在机器间手工复制不同版本。
2. **安装到宿主搜索目录**：将整个 muti-agents 文件夹放入当前 Agent runtime 支持的 Skill 目录。可按项目配置选择 .agents/skills/、.claude/skills/、.codex/skills/、.cursor/skills/ 或 .gemini/skills/ 等目录；用户级目录随 runtime 和操作系统而异，以宿主当前文档为准。保留原有目录结构与 assets/、scripts/、references/。
3. **上下文兜底**：若宿主没有 Skill 自动发现机制，把 SKILL.md 读入当前 Agent 上下文；涉及具体分支时再读取相应子目录的 SKILL.md。此方式不会安装脚本，也不会证明宿主具有委派能力。

## 支持状态

以 [Agent 注册表](assets/agents-registry.json) 和当前会话的实时能力为准。首版登记 t3-code，平台为 Windows、macOS、Linux；适配器提供原生 MCP 与 ACP MCP 调用通道。机器上有脚本不代表当前会话能执行这些工具。

| 方案 | 阶段 | 状态 |
|---|---|---|
| S-01：Plan（Gemini 4 Neon）→ Exec（GPT-6 Luna）→ 验收（Gemini 4 Neon） | 研究与计划 → 实现 → 主线程审查 | 已登记，支持宿主见注册表 |

方案详细参数见 [协作方案注册表](assets/schemes-registry.json)。新增宿主或方案时先读对应规范并经过人类门禁。

## 使用示例

请求：“按 S-01 实现已确认的菜单修复计划；只允许修改 src/menu/，完成后运行 npm test -- src/menu。”

Agent 应先运行环境探测、展示当前宿主与能力，再让用户确认方案及任务简报。明确授权后才委派。验收报告应列出改动文件、测试命令与结果；若委派只启动但尚无完成通知，报告等待状态。

## 目录

- [入口与四步流程](SKILL.md)
- [阶段交接清单](assets/阶段交接与门禁清单.md)
- [宿主识别与路由](intention-skills/识别-当前Agent与适配决策/README.md)
- [协作方案选择](intention-skills/选择-多Agent协作方案/README.md)
- [执行 T3 委派](feature-skills/执行-T3Code分模型委派/README.md)
- [扩展新宿主](feature-skills/扩展-新Agent适配Loop/README.md)
- [沉淀新方案](feature-skills/沉淀-新协作方案/README.md)
- [参考资料](references/agent-adapter-spec.md)
- [模板与真实样本](template/mvp/README.md)、[运行快照](template/snapshot/README.md)

## 静态检查与回归

在仓库根目录执行：

~~~sh
node --test agent-skills/muti-agents/scripts/delegate-t3-task.test.mjs
git diff --check
~~~

Skill 结构评估由 Darwin check 完成；测试集和触发用例见 test-prompts.json、trigger-tests.json 与 evals/evals.json。回归时确认测试用例有客观检查项，触发测试同时覆盖相邻批处理 Skill 的边界。

## 扩展

- 新 Agent：按 [适配器规范](references/agent-adapter-spec.md) 探测宿主能力，先展示提案并等待确认，再实现最小适配与烟雾验证。
- 新方案：按 [方案编写指南](references/scheme-authoring-guide.md) 明确阶段、默认参数、门禁和验收；修改注册表前先让用户确认。
- 调整流程：保留可核对证据并更新对应测试；不要将未知能力写成已支持。
