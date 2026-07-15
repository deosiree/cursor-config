---
name: merge临时分支-few-shot
description: few-shot 样本壳；正式规则以父级 SKILL.md 为准。
---

# 正确触发

**用户：** 临时分支 `auto-optimize/xxx` 收工了，merge 进 main，不要这条分支了，先别 push。

**Agent：** status 干净 → 展示 main..source 列表 → CHECKPOINT-1 → checkout main → merge --no-ff → 验收 → CHECKPOINT-3 删分支 → 不 push。

# 应改走 cherry-pick

**用户：** 临时分支里只要那三次 translate 相关提交到 main。

**Agent：** 不激活本 skill；引导 [[../../按顺序cherry-pick到其他分支/SKILL.md]]。
