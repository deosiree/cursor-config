# 推送草稿 + revert 草稿，待审核结束再推送最终版本

## 一句话（长名字是干嘛的）

在**共享分支**（默认 `develop`）上：先推草稿给人看 → 本地临时分支 `reset` 审查 →（可选）审查中先把 bug 修到 develop，再把**草稿+热修整包改动**收回本地做整批审查优化 → 远端对整段系列 `revert` → 再 push 最终版。**禁止强推。**

## 口令

```text
push 草稿 → 临时分支 reset
  →（可选热修）stash 切走 → develop 修 bug → push origin[+upstream]
       → 审查分支指向 tip → mixed reset 到草稿父提交（整包 A..tip 在工作区）
  → 审查优化出最终提交
  → pull → 新→旧 revert 系列(B+H…) → cherry-pick 最终 → push → 删临时分支
```

## 远端历史长什么样

```text
… → 草稿(B) → 热修(H…) →（同事）→ revert(H)…revert(B) → 最终版(F)
```

- 热修是往前推进；回来审查的是 **B+H 合并后的代码**，不是修 bug 前的旧 WIP  
- `publish` 时系列都要 revert，因此 F 必须自带仍需要的修复内容  

## Frontmatter 模式

**本地中文模式**：见 [[SKILL.md]]。

## 职责边界

| 本套件 | 邻近 skill |
| --- | --- |
| 草稿 → 审查 →（热修+整包收回）→ 系列 revert → 最终版 | [[../merge临时分支到主分支并删除临时分支/SKILL.md]] |
| 保留历史用 revert | [[../按顺序cherry-pick到其他分支/SKILL.md]] |
| 临时分支服务审查 | [[../创建沙盒分支/SKILL.md]] |
| 不管批提交文案 | `git-commit-batching-workflow` |

## 怎么用

```text
审查中 CI 挂了：先修 develop 双推，再把草稿+热修整包收回临时分支继续审查优化。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

叙事：[[template/示例-审查中热修js-yaml依赖.md]]、[[template/示例-develop草稿后审查再最终版.md]]

## 阶段速查

| 你在说什么 | phase | 回来审查时工作区 |
| --- | --- | --- |
| 先给人看一版 | `push_draft` | — |
| 草稿收回来改 | `local_review` | 仅草稿 B |
| CI/bug 先修再审全部相关提交 | `hotfix_during_review` | **草稿+热修整包**（非旧 stash） |
| 审完上最终版 | `publish_final` | 干净树 → revert 系列 → final |

## 验收方式

- [[evals/触发用例.md]] · [[assets/执行检查清单.md]] · [[evals/darwin-hl4-final.md]]（hotfix 后 HL-4：**87.8**，建议收手）
