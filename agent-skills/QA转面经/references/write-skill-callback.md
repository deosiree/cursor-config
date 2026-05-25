# write-skill callback 摘录（QA转面经）

来源：`agent-skills/write-skill/references/write-skill-single-guardrails.md`

## 硬检查项

1. 主 `SKILL.md` 含 RED、GREEN、REFACTOR 与使用示例
2. 主文档写清何时使用、何时不用、入参、路由
3. 子 skill 非空心（含任务、输入、输出、边界、示例）
4. `template/` 给人看，`assets/` 给 agent；职责不混
5. `evals/evals.json` 覆盖应触发、不应触发、边界
6. N/K/doc_type 以 `_shared` 契约为准，不在两处重复长表
7. 步骤 6 转播客须用户确认，流程不并入本 skill

## 空心化判定

- 仅标题 + 一句定位
- 边界只在 few-shot/evals，主 SKILL 无
- 读完主 SKILL 仍不知与 post-mortem / 文档转播客 分工
