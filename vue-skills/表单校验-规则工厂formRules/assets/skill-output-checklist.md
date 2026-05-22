# Skill 输出验收清单

## 结构

- [ ] `SKILL.md` 中文 `name` / `description`
- [ ] 含 RED / 路由表 / 检查点 / 使用示例
- [ ] 6 个 `feature-skills/` 齐全（含盘点-推荐下一表单字段，且含 `test-prompts.json`）
- [ ] `references/` 含 project-discovery、rule-style-registry、formRules-module-map、message-key-constraints、两种 model、form-field-inventory-model、known-issues
- [ ] `template/sample-nebula/after/` 为编排/接入示意（非完整 validate 副本）
- [ ] `template/mvp/`
- [ ] `assets/few-shot-example/` 至少 5 篇（含 inventory-recommendation-sample）
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
- [ ] 全套件无 `trimNameOnBlur` / `trimRoutePathOnBlur`（统一 `trimFieldOnBlur`）

## 触发边界

- [ ] should-trigger：formRules、表单校验、路由路径校验、标识符命名、盘点下一项、覆盖度
- [ ] should-not-trigger：i18n 翻译、OperationColumn、非表单
