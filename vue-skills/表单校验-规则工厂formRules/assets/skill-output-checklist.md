# Skill 输出验收清单

## 结构

- [ ] `SKILL.md` 中文 `name` / `description`
- [ ] 含 RED / 路由表 / 检查点 / 使用示例
- [ ] 8 个 `feature-skills/` 齐全（含盘点、pwdPair、维护-从业务仓同步样本；盘点含 `test-prompts.json`）
- [ ] `references/` 含 project-discovery、rule-style-registry、formRules-module-map、message-key-constraints、name/path/**password-pair** model、form-field-inventory-model、known-issues
- [ ] `template/sample-nebula/after/formRules.ts` 完整成品 + `*.fragment.ts` 增量段并存且语义一致
- [ ] `template/mvp/`
- [ ] `assets/few-shot-example/` 至少 6 篇（含 inventory-recommendation、**pwd-pair-tips-sample**）
- [ ] `agents/openai.yaml` display_name 为「表单校验-规则工厂formRules」
- [ ] `evals/` 含 should-trigger / should-not-trigger

## 内容质量

- [ ] 主 skill 可独立完成 ruleStyle 路由
- [ ] 子 skill 可独立执行
- [ ] **无** commit hash / 版本 ID 作为执行依据
- [ ] 明确「不含 i18n locale」边界

## 技术一致性

- [ ] 默认改动集不含 `locales/*.json`
- [ ] pathLike 与 nameIdentifier 不混写在同一子 skill 正文
- [ ] messageKey 遵守 [`message-key-constraints.md`](../references/message-key-constraints.md)
- [ ] 无文档要求 export `validateRoutePathSyntax` / `validateApiPathSyntax`
- [ ] pwdPair 文档含 `validate-on-rule-change`、网关 getPwdPolicy、`pwdPlcyTip` + 双仓 PwdPolicyTip；不 export 默认 policy 常量
- [ ] pathLike 使用 `PATH_MAX_LENGTH`，不维护 `RULE_TRIGGER` 模块常量
- [ ] 全套件无 `trimNameOnBlur` / `trimRoutePathOnBlur`（统一 `trimFieldOnBlur`）

## 维护（改 pathLike / name 后）

- [ ] 只改 [`formRules.ts`](../template/sample-nebula/after/formRules.ts)
- [ ] skill 根目录：`node scripts/sync-samples.js` exit 0（或 extract + verify 分步）
- [ ] `.cursor` 已 `npm install` + `formrules:install-hook`（提交样本时 pre-commit 防漏跑）
- [ ] 业务仓落地后：`sync-from-repos --dry-run` / `--apply`（真源 apex）；见 [`维护-从业务仓同步样本`](../feature-skills/维护-从业务仓同步样本/SKILL.md)
- [ ] 流程见 [`scripts/README.md`](../scripts/README.md)

## 触发边界

- [ ] should-trigger：formRules、表单校验、路由路径校验、标识符命名、**pwdPair/密码策略**、**同步 skill 样本/formRules 样本对齐**、盘点下一项、覆盖度
- [ ] should-not-trigger：i18n 翻译、OperationColumn、非表单
