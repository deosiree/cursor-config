# Skill 输出检查清单

- [ ] 顶层存在 `README.md`、`SKILL.md`、`template/`、`assets/`、`references/`、`evals/`
- [ ] `SKILL.md` 的 `name` 与 `description` 使用中文
- [ ] 根 `SKILL.md` 明确保留 `RED`、`GREEN`、`REFACTOR`
- [ ] 主 `SKILL.md` 只保留路由、分析准则与硬约束，不堆大段示例正文
- [ ] 顶层明确区分 `intention-skills/` 与 `feature-skills/`
- [ ] 顶层明确区分 `analysis_required` 与 `analysis_optional`
- [ ] 顶层明确描述没有父 agent 时会怎么失败，而不是只写理想工作流
- [ ] 顶层单轮输出字段包含 `chainConfidence`
- [ ] 顶层说明未明确允许多轮人工确认时的默认策略
- [ ] `分析-i18n链路` 被描述为横向公共前置能力，而不只是独立意图 skill
- [ ] `编排-i18n迁移` 与 `路由-选择功能子skill` 明确声明可在事实不足时先依赖分析结果
- [ ] 顶层能解释自己不是一次性 router，而是会话级父 agent
- [ ] `template/` 提供父 agent 单轮输出成品样例
- [ ] 根层 few-shot 或模板已索引 `analysis-first-then-plan`、`analysis-first-then-route`、`analysis-first-then-strategy`
- [ ] `evals/evals.json` 至少覆盖分析优先、总方案、策略判断和单次功能路由
