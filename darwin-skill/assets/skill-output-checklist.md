# 达尔文式技能优化输出检查清单

## 结构检查

- [ ] 主 `SKILL.md` 只保留执行规则、门禁和评分口径
- [ ] 已存在 `references/`、`evals/`、标准 `template/`
- [ ] 已存在 `assets/frontmatter-template.yaml`
- [ ] 已存在 `assets/few-shot-example/README.md`
- [ ] 已存在 `assets/few-shot-example/SKILL.md`

## 试跑检查

- [ ] 至少有 1 组 `test-prompts.json`
- [ ] 至少有 1 份 `results.tsv` 样例
- [ ] 至少有 1 份 baseline 报告样板
- [ ] 明确标注 `eval_mode` 是 `full_test` 还是 `dry_run`
- [ ] 首轮建议仍是单 skill 的 `evaluate-only` 或 `controlled-trial`

## 兼容检查

- [ ] 不再把 `.claude/skills` 当成唯一技能根目录
- [ ] README 已解释 `template/` 与 `templates/` 的职责差异
- [ ] 路径发现顺序已经写入主 `SKILL.md` 或 references

## 输出质量检查

- [ ] 输出包含 baseline 分数与最弱维度
- [ ] 如果发生修改，输出包含 `keepOrRevert`
- [ ] 如果无法 full test，明确说明是 `dry_run`
