---
name: 编排-同步skill收益
description: 源仓 harness 学会新范式后，提炼可迁移能力并更新本 skill 套件，供他仓对照缺口；禁止把业务特例写入能力清单。触发词：同步 skill、更新可迁移能力、harness 新范式、吃到收益、同步到创建harness工作流。
---

# 编排-同步skill收益

## 目标

源仓（如刚改完 QUALITY_LOOP / 新审查范式的仓）→ **本套件** `references/可迁移能力.md`（及必要 feature/样例）更新，使他仓下次「升级 harness」能勾到新能力。

**不是**把他仓立刻改掉；**不是**把源仓业务规则写进父 SKILL。

## 输入

| 字段 | 要求 |
| --- | --- |
| `sourceHarnessPath` | 必填。缺失 → 🔴 问路径 |
| `changeHint` | 可选：人指出改了哪些文档/范式名 |
| `allowDarwin` | 默认 `evaluate-only`；人说优化再 `optimize` |

## 编排顺序

1. 读取源仓变更：git diff / 人指定文件（AGENTS、ARCHITECTURE、QUALITY_LOOP、HARNESS_REVIEW、FEATURE_INTAKE、evals 协议等）  
2. `[[../../feature-skills/提炼可迁移能力条目/SKILL.md]]` — 产出 `portableCapabilities` 与 `rejectedAsBusinessSpecial`  
3. 🔴 CHECKPOINT：展示拟新增/改写的能力行，等人确认后再改文件  
4. 写入 `[[../../references/可迁移能力.md]]`；若需说明填法，**仅**更新 `[[../../references/样例-Nebula.md]]` 对应槽位，并标「须改写」  
5. 若新能力需要新执行步骤 → **新开或补 feature**，禁止把长流程写进父 `SKILL.md`  
6. `[[../../feature-skills/反拷贝与泄漏扫描/SKILL.md]]` — 扫描本套件改动  
7. 交接 `[[../编排-skill质量迭代/SKILL.md]]`：`darwinFollowUp`  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 提炼结果全是业务专有名词 | 全部进 rejected；不写可迁移能力 | 🛑 不同步 |
| 人要求「把源仓 docs 拷进 skill 主文件」 | 拒绝；只允许能力表+样例槽位 | 终止 |
| 与现有 P0/P1 重复 | 合并验收问句，不新增同义行 | 记录 skip |
| 未确认就改文件 | 回退到 CHECKPOINT | 不得 DONE |

## 输出

```yaml
route: "编排-同步skill收益"
sourceDiffSummary: ""
portableCapabilities:
  - { tier: "P0|P1|P2", name: "", exampleShape: "", acceptanceQuestion: "" }
rejectedAsBusinessSpecial: []
skillFilesToPatch:
  - { path: "references/可迁移能力.md", change: "" }
darwinFollowUp: "evaluate-only|optimize|skip"
stopOrCheckpoint: ""
sampleLeakScan: "通过|失败"
```

## 使用示例

```text
sourceHarnessPath=F:\Documents\Repertory\Sieyuan\nebula
刚引入证据阶梯质量 Loop，同步到创建harness工作流，再 Darwin evaluate-only。
```
