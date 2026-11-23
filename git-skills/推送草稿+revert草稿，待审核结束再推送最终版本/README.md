# 推送草稿 + revert 草稿，待审核结束再推送最终版本

## 一句话（长名字是干嘛的）

在**共享分支**（默认 `develop`）上：先推草稿给人看 → 本地临时分支 `reset` 审查 →（可选）热修整包收回 →（可选）远端**保持**待审最新、改动收回本地审 → 审完后**成对**推 `revert:` + 最终版。**禁止强推；禁止审前单独推 revert。**

## 口令

```text
push 草稿 → 临时分支 reset
  →（可选热修）…整包收回…
  →（可选）记下 tip → 只 reclaim 到临时支（远端 tip 不变）
  → 审查优化出最终提交
  → pull → revert: 系列 → cherry-pick 最终 → 双推（两笔同次发布）→ 删临时分支
```

## 远端历史长什么样

```text
… → 草稿(B) → 热修(H…) →（同事）→ revert(H)…revert(B) → 最终版(F)
```

- 热修是往前推进；回来审查的是 **B+H 合并后的代码**，不是修 bug 前的旧 WIP  
- `publish` 时系列都要 revert（若已 `revert_and_reclaim` 则跳过重复），因此 F 必须自带仍需要的修复内容  
- 保护分支只能**追加** `revert:`，不能改写已推送历史  

## Frontmatter 模式

**本地中文模式**：见 [[SKILL.md]]。

## 职责边界

| 本套件 | 邻近 skill |
| --- | --- |
| 草稿 → 审查 →（热修+整包收回）→（可选推 revert 收回）→ 系列 revert → 最终版 | [[../merge临时分支到主分支并删除临时分支/SKILL.md]] |
| 保留历史用 revert | [[../按顺序cherry-pick到其他分支/SKILL.md]] |
| 临时分支服务审查 | [[../创建沙盒分支/SKILL.md]] |
| 不管批提交文案 | `git-commit-batching-workflow` |

## 怎么用

```text
审查中 CI 挂了：先修 develop 双推，再把草稿+热修整包收回临时分支继续审查优化。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

```text
保护分支：远端保持最新待审版；改动收回本地审；审完再成对推 revert: + 最终版（现在不要推 revert）。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

叙事：[[template/示例-审查中热修js-yaml依赖.md]]、[[template/示例-develop草稿后审查再最终版.md]]  
原理：[[references/为何保护分支用revert提交回滚.md]]

## 阶段速查

| 你在说什么 | phase | 回来审查时工作区 |
| --- | --- | --- |
| 先给人看一版 | `push_draft` | — |
| 草稿收回来改（远端不动） | `local_review` | 仅草稿 B |
| CI/bug 先修再审全部相关提交 | `hotfix_during_review` | **草稿+热修整包**（非旧 stash） |
| 保护分支撤远端上一版并拿回本地审 | `revert_and_reclaim` | **整包**；**远端 tip 不变** |
| 审完上最终版 | `publish_final` | 干净树 → **成对** revert: + final |

**易混**：收回本地审 ≠ 审前推 `revert:` 让远端变旧 ≠ 立刻上最终版。审前推 revert 是 RED。

## 验收方式

- [[evals/触发用例.md]] · [[assets/执行检查清单.md]] · [[evals/darwin-hl4-final.md]]（revert_and_reclaim 后 HL-4：**87.4**，建议收手）
