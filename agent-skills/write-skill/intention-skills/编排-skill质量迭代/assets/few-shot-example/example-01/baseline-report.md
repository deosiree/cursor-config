# baseline 报告样例

## Target

- `skill`: `gen-perms-apis`
- `path`: `.cursor/nebula-skills/gen-perms-apis/SKILL.md`
- `mode`: `evaluate-only`
- `eval_mode`: `dry_run`

## 8 维评分

| 维度 | 分数 | 观察 |
|---|---:|---|
| Frontmatter 质量 | 8 | 中文化较完整，但 description 可再收紧 |
| 工作流清晰度 | 7 | 主流程基本清楚，局部门禁还可压实 |
| 边界条件覆盖 | 6 | 有回退意识，但失败场景还不够具体 |
| 检查点设计 | 6 | 有人工介入意识，但触发时机还能更明确 |
| 指令具体性 | 8 | 输出结构较清楚，部分字段仍可固定 |
| 资源整合度 | 7 | references 与模板存在，但少数入口可再明确 |
| 整体架构 | 8 | 套件化完成度较高 |
| 实测表现 | 6 | 只做 dry_run，推演合理，但尚未 full_test |

**总分：74.0**

## 最弱维度

1. 边界条件覆盖
2. 检查点设计
3. 实测表现

## 建议下一步

- 保持 `evaluate-only` 结论不变，不直接进入自动优化。
- 先补 2-3 条更贴近真实调用的测试提示词。
- 下一轮可进入单 skill 的 `controlled-trial`，但仍建议保留 `dry_run` 兜底。
