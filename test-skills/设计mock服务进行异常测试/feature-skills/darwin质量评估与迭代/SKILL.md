---
name: darwin质量评估与迭代
description: 试跑 test-prompts、mock 产物评分、keep/revert；桥接 darwin-skill。
---

# Feature：Darwin 质量评估与迭代

## 模式

- **evaluate-after-delivery**：每批用例交付后可选试跑
- **evaluate-only**：仅评 skill 文档与 few-shot

## 何时触发

- REFACTOR 阶段，`质量-手工自测门禁` 通过后
- 用户 `allowDarwin: true`（默认）

## 流程

1. 从 [[../../evals/test-prompts.json]] 取 prompt
2. 按 [[../../SKILL.md]] RED → intention → feature 执行
3. 跑 [[质量-手工自测门禁/SKILL.md]]
4. 按 [[../../evals/evaluate-only-baseline.md]] 评分
5. 写入 `evals/results/{id}-{date}.md`
6. keep/revert

## 本 skill 额外维度

| 维度 | 检查 |
|------|------|
| mock 路径 | 含 `forward/`，Windows 正斜杠 |
| scenario | `error-scenario.json` 可切换 |
| README | 可独立执行，链 workflow 无重复 |
| 权限门禁 | pending_human 未误标 ok |
| 误路由 | 不写 pytest / 不改 vite |

## keepOrRevertRule

| 总分（100 分制） | 决策 |
|------------------|------|
| ≥85 | **keep** |
| <85 | **revert** mock 追加块，保留 README/registry 草稿 |

产物 12 分制见 [[../../evals/evaluate-only-baseline.md]] 附录。

## 桥接

完整 Darwin rubric：[[darwin-skill]]（`C:/Users/Administrator/.claude/skills/darwin-skill/SKILL.md`）

## 使用示例

```text
对 test-prompts 中 mvp-3545-replay 跑 Darwin 评分。
```
