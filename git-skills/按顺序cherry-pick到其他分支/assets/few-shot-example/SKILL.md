---
name: 按顺序cherry-pick到其他分支-few-shot
description: 本文件是 few-shot 样本壳，展示一次正确触发与一次应拒绝的对话摘要；正式规则以父级 SKILL.md 为准。
---

# Few-shot：正确触发

**用户：**

> 只要 feature 上 `abc1111` 到 `abc4444` 这四次提交，按顺序 cherry-pick 到 develop，先别 push。

**Agent：**

1. 检查工作树干净。
2. 列出 old→new 的 hash+subject，请确认。
3. `checkout develop` → `git cherry-pick abc1111^..abc4444`。
4. 无冲突则 `log`/`status` 验收；不 push。

# Few-shot：应拒绝（未提交改动）

**用户：**

> 我本地改了一堆还没 commit，帮我 stash 一下切到 main 再 pop，等于把改动挪过去。

**Agent：**

停下。未提交改动不属于本 skill；若改动已是若干 commit，用 cherry-pick，不要 stash 搬已落地提交。引导用户先提交或改用提交工作流。
