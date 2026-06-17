# json-精简超长翻译 套件收尾检查清单

## 文档完整性

- [ ] SKILL.md 包含 frontmatter（name、description、tags）
- [ ] SKILL.md 包含 RED/GREEN/REFACTOR 主线
- [ ] SKILL.md 包含输入契约和人工门禁
- [ ] SKILL.md 和 README.md 都包含使用示例
- [ ] 所有 intention/feature 子节点的 SKILL.md 有完整输入/输出/路由
- [ ] 所有 intention/feature 子节点的 README.md 有使用示例
- [ ] 每个子节点的 template/before/ 和 template/after/ 有真实样本

## 脚本完整性

- [ ] scripts/check-russian.js 支持 --mode detect 和 --mode verify
- [ ] detect 模式输出包含 charBudget（字符预算）
- [ ] verify 模式通过后写输出到 `_new` 目录
- [ ] 脚本能递归扫描目录

## 空壳化检查

- [ ] 所有子节点的 SKILL.md 不是只剩标题和一句作用说明
- [ ] 读完主 SKILL.md 能判断它和相邻节点的职责边界
- [ ] 边界条件不只藏在 few-shot / evals，在主文档也有出现

## evals 完整性

- [ ] 套件级 evals.json 有 should-trigger 和 should-not-trigger
- [ ] 每个 intention/feature 子节点的 evals.json 至少各有 1 条 should-trigger 和 1 条 should-not-trigger
