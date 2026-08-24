---
name: 创建harness工作流
description: 父级 agent：为任意仓创建/升级 harness，或把源仓新范式同步进本 skill 的可迁移能力，再经 Darwin 质量门。先分析现状再路由 intention，细节在子 skill。触发词：创建 harness、升级 harness、同步 skill 收益、可迁移能力、harness 范式、质量 Loop、表面分拣、认识项目、darwin harness skill。
---

# 创建harness工作流（父 agent）

## 目标

让 harness **认识并协同目标项目**；源仓学会新范式后，能**同步进本套件**供他仓对照缺口，而不是拷贝业务特例。

| 学 | 不学 |
| --- | --- |
| 发现拓扑/主域/SSOT/验证手段；分拣；证据门；能力对照 | 样例仓会话模型、命名陷阱、后端边界等业务事实 |
| 把新范式提炼为可迁移能力条目并更新本 skill | 把样例 docs 全文塞进他仓或堆进父 SKILL |

样例附录：`[[references/样例-Nebula.md]]`（须改写）。

## 何时使用 / 不要使用

**用：** 无 harness 从 0 建；旧 harness 升级；源仓 harness 更新后同步本 skill；对本套件跑 Darwin。  
**不用：** 纯业务改码；学某产品业务逻辑；无关润色。

## 输入契约

| 字段 | 要求 |
| --- | --- |
| `targetPath` | 创建/升级时必填或可扫；缺失 → 🔴 问路径，YAML 填 `unknown`，禁止用当前 IDE 工作区冒充 |
| `sourceHarnessPath` | **同步 skill 收益**时必填（刚更新过 harness 的仓） |
| `mode` | 由 `分析-harness现状` 判定，禁止臆造 |

幕1（Discovery）未完成前，禁止写入目标仓正式 harness 文件。

## 速查路由

```text
用户要改「本 skill 套件」质量/评分？
  → intention: 编排-skill质量迭代（Darwin）
用户说「harness 刚学了新范式，同步到 skill」？
  → intention: 编排-同步skill收益
否则先 → intention: 分析-harness现状
  ├─ 无 harness → 编排-无harness创建
  ├─ 旧 harness → 编排-旧harness升级
  └─ 仅对照缺口、不写文件 → 停在分析 + 对照可迁移能力
拷贝样例业务/L2 路径？ → 🛑 拒绝（走 反拷贝与泄漏扫描）
```

## Intention 路由表

| 判定 | 读 |
| --- | --- |
| 现状不明 / 无\|旧未分 | `[[intention-skills/分析-harness现状/SKILL.md]]` |
| 无 harness | `[[intention-skills/编排-无harness创建/SKILL.md]]` |
| 有旧 harness | `[[intention-skills/编排-旧harness升级/SKILL.md]]` |
| 源仓新范式 → 更新本 skill | `[[intention-skills/编排-同步skill收益/SKILL.md]]` |
| 评估/优化本套件 | `[[intention-skills/编排-skill质量迭代/SKILL.md]]` |

**Single Dispatch：** 一次只进一个 intention；需要 feature 时由该 intention 点名，禁止一次拉齐全部 feature。

**同轮衔接（创建/升级）：** 用户已给 `targetPath` 且意图明确时，允许**同一条回复内**先输出 `分析-harness现状` 的 `mode`，随即进入对应编排 intention（仍算两次逻辑步骤、一份最终 YAML 用最终 `route`）。禁止跳过分析直接写文件；禁止并行拉多个 intention。

## 失败分支（父路由层）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| `targetPath` 缺失且非同步/非 Darwin | 🔴 问绝对路径；YAML 全 `unknown` | `route` 停在分析；禁止写正式文件 |
| 同步场景缺 `sourceHarnessPath` | 🔴 问源仓路径 | 不进提炼；不得改 `可迁移能力.md` |
| 无/旧未分清就开写 | 先 `分析-harness现状` 得 `mode` | mode 未知 → 🛑 不调度创建/升级 |
| 一次拉齐全部 feature | 打回：只保留 intention 点名的节点 | 超范围输出作废 |
| 用户要拷样例业务/L2 路径 | 🛑 + `反拷贝与泄漏扫描` | 终止本轮；不得 DONE |
| 同步想把细则堆进父 SKILL | 🛑 只改能力表/样例/feature | 拒绝写父文件长流程 |

子节点细则失败表仍以其自身 SKILL 为准；本表只管**路由与派发**。

## Feature 索引（按需）

| 能力 | 读 |
| --- | --- |
| Discovery 表 | `[[feature-skills/认识项目Discovery/SKILL.md]]` |
| P0–P2 勾缺口 | `[[feature-skills/对照可迁移能力/SKILL.md]]` |
| 反拷贝 / sampleLeakScan | `[[feature-skills/反拷贝与泄漏扫描/SKILL.md]]` |
| 从 0 写最小文件集 | `[[feature-skills/落地最小文件集/SKILL.md]]` |
| 合并旧文档 | `[[feature-skills/合并升级缺口/SKILL.md]]` |
| 新范式→能力条目 | `[[feature-skills/提炼可迁移能力条目/SKILL.md]]` |
| HARNESS 膨胀 / SSOT 解耦 | `[[feature-skills/Harness解耦与反漂移/SKILL.md]]` |

清单 SSOT：`[[references/可迁移能力.md]]`。

## 硬约束与黑名单

1. 禁止把样例命名/会话/后端边界当通用真理拷贝  
2. 禁止教业务逻辑替代「如何发现边界」  
3. 禁止盲升领域 skills 压过目标仓宪法  
4. 禁止用 L0 type-check 冒充完整质量 Loop  
5. 禁止自动 hook 强绑 Eval  
6. 禁止把新范式业务特例直接写入 `可迁移能力.md`（必须先走提炼条目）  
7. 禁止向业务子仓根提交可入库完整 harness（零侵入 → 🛑）

反例细则：`[[feature-skills/反拷贝与泄漏扫描/SKILL.md]]`。

## 输出契约

创建/升级路径每轮必须含（缺一块=未完成）：

```yaml
route: ""                    # 命中的 intention 名
discoveryTable: {}
gapChecklist: []
filesToWrite: []
qualityLoopMeans: { L0: "", L1: "", L2: "" }
stopOrCheckpoint: "无 | 🔴… | 🛑…"
sampleLeakScan: "通过|失败"
```

同步 skill 收益路径改为：

```yaml
route: "编排-同步skill收益"
sourceDiffSummary: ""
portableCapabilities: []     # 拟写入可迁移能力的条目
rejectedAsBusinessSpecial: []
skillFilesToPatch: []
darwinFollowUp: "evaluate-only | optimize | skip"
stopOrCheckpoint: ""
sampleLeakScan: "通过|失败"
```

### 发出前自检

1. 已声明 `route` 且只调度了必要子 skill  
2. 含 🔴/🛑 时未声称已写正式文件  
3. 无「必须拷贝样例 L2/会话模型」指令  

## RED / GREEN / REFACTOR

- **RED：** 跑 `分析-harness现状`（或同步场景下先确认 `sourceHarnessPath`）  
- **GREEN：** 进入对应编排 intention，按需调 feature  
- **REFACTOR：** 复发失败写入目标仓黑名单/ADR/Eval，或走「同步 skill 收益」更新本套件，禁止把细则堆回本父文件  

## 使用示例

```text
F:\work\acme-web 没有 AGENTS，用创建harness工作流从 0 建。
```

```text
旧仓已有 AGENTS，缺质量 Loop，升级 harness。
```

```text
Nebula 刚引入新范式，同步到创建harness工作流 skill，让他仓能对照缺口。
然后跑 Darwin evaluate-only。
```
