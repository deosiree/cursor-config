---
name: few-shot-推送草稿与revert最终版
description: Agent 按需读取的正/反触发样本，辅助路由到本套件正确 phase。
---

# 正触发 · 整条链路

```text
User: 先把现在这版 push 到 develop 给后端看，然后我要本地 reset 回来大改，
改完再在 develop 上 revert 草稿、推最终版。不要强推。
Assistant: phase 顺序 push_draft → local_review → publish_final；禁 force；记下 draftSha。
```

# 正触发 · 只发布最终

```text
User: 草稿 SHA 是 abc…，最终在 temp/review-after-draft 的 def…。
请 pull develop，revert abc，cherry-pick def，push，删临时分支。
Assistant: phase=publish_final → 编排-revert并推送最终版。
```

# 正触发 · 审查中热修（整包收回）

```text
User: Jenkins 缺 js-yaml。先修 develop 双推；回来不要恢复修 bug 前的 WIP，
要把草稿和热修提交都收回本地，基于已修复代码整批审查。
Assistant: phase=hotfix_during_review → stash(仅切分支) → 热修 push →
checkout -B temp tip → reset draft^；默认 drop 旧 stash；draftSha 不变；输出 seriesTip。
```

# 误触发 · 强推特性分支

```text
User: 我的 feature/foo 上草稿没人基于它开发，直接 force-with-lease 盖掉重推最终版。
Assistant: handoff_force_push；说明本套件面向共享分支 revert 流程，不代做强推。
```

# 误触发 · 脏审查分支直接切 develop

```text
User: 不用 stash，直接 checkout develop 改依赖再回来。
Assistant: STOP；必须先 stash 或确认 WIP 已保存，禁止裸切丢改动。
```

# 误触发 · 整支 merge

```text
User: 临时分支收工了，merge 进 main 然后删掉。
Assistant: 改路由 → merge临时分支到主分支并删除临时分支。
```
