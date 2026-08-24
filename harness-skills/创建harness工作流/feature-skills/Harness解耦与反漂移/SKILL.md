---
name: Harness解耦与反漂移
description: 旧 harness HARNESS/AGENTS 膨胀、SSOT 漂移、检索指向错误时：审计重复→WRITE_RULES+conventions 迁出→slim 入口文档→drift-audit+期末卷→Darwin evaluate-only。触发词：HARNESS 膨胀、SSOT 解耦、反漂移、协议瘦身、WRITE_RULES。
---

# Harness解耦与反漂移

## 目标

把「一条心智写五处」的旧 harness 收成 **SSOT 正文 + 指针**，并用结构/检索/反膨胀三层卷证明改后比改前更好用。**migrate-out = delete 正文**，禁止 split 后留拷贝。

## 何时使用

- `gapChecklist` 含：HARNESS 习惯堆叠、AGENTS 长 few-shot、CONTEXT 双表、负责人主域多份拷贝
- 检索 Eval 或人工反馈：Agent 先读 HARNESS 400 行而非 conventions
- harness-meta 大改前需置信度门禁

**不用：** 无 harness 从 0 建（走 `落地最小文件集`）；纯业务改码。

## 前置

- `mode=legacy` 或 `surface=harness-meta`
- 已跑 `对照可迁移能力`，缺口含 P1：写入约束 / 四址 / 协议习惯解耦 / 漂移审计 之一

## 编排步骤

1. **审计重复** — 列出同一主题在 HARNESS、AGENTS、CONTEXT、FEATURE_INTAKE、REVIEW 的出现次数与行数  
2. **建 WRITE_RULES** — 落点决策树 + 「Harness 文档 SSOT 表」**唯一整表**（他处 ≤2 句链）  
3. **迁出习惯** — 编码/交互习惯 → `docs/conventions/*`；本地 Meta 约定 → `conventions/meta-workspace.md`（或目标仓等价路径）  
4. **Slim 入口** — `HARNESS.md` 只留请求类别循环 + 协议索引；上游叙事 → `HARNESS_PROTOCOL.md`（**零 CLI 命令块**）  
5. **四址指针** — CONTEXT 1 行链、AGENTS ≤2 句、REVIEW 心智表 1 行；删除迁出处正文  
6. **漂移审计** — 新增或挂接 `*-drift-audit.mjs`（行数门闩、SSOT 表重复、CLI 复制、落盘表重复）→ ci-smoke  
7. **期末三层卷** — 结构卷（drift-audit）+ 检索卷（prompts+rubric）+ 反膨胀协议题（拒绝堆回 HARNESS）  
8. 🔴 **CHECKPOINT**：展示 `decouplePlan` + `evalAssets` 摘要，等人确认 keep 方向后再跑 Darwin  
9. **Darwin evaluate-only** — pre 锚点 → 改后 scorecard **keep** 才 DONE；HL-4：连续两轮结构分 Δ&lt;2 → 停堆主文档  

Few-shot 链（须改写）：见 `[[../../references/样例-Nebula.md]]` 期末卷旁证槽位（HARNESS 403→58 行、检索 9/9 为样例旁证）。

## 体积门闩（示例，目标仓自定）

| 文件 | 建议上限 |
| --- | --- |
| HARNESS.md | ≤320 行 |
| HARNESS_PROTOCOL.md | ≤180 行 |
| AGENTS.md | ≤150 行 |
| conventions 单节 | ≤80 行 |

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| split 后旧处仍留 >15 行正文 | 删正文只留链 | drift-audit 应 fail |
| PROTOCOL 复制 CLI/表 | 改叙事 + 链 scripts/README | 不得 pass 审计 |
| 检索改后 MISS 改前 HIT 的题 | revert 或补链 | 🛑 不得 keep |
| 未 CHECKPOINT 即声称 keep | 回到步骤 8 展示 decouplePlan | 不得 DONE |
| 为抬分再堆 HARNESS | HL-4 停；改 fixture/live | revert |
| 拷样例 WRITE_RULES 全文进 AGENTS | 反拷贝扫描失败 | 终止 |

## 输出

```yaml
decouplePlan:
  - { topic: "", from: [], to: "", action: "migrate|delete|link-only" }
evalAssets:
  - { type: "drift-audit|retrieval|anti-bloat", path: "" }
darwinMode: "evaluate-only"
stopOrCheckpoint: "无 | 🔴… | 🛑…"
sampleLeakScan: "通过|失败"
```

## 使用示例

```text
目标仓 HARNESS 420 行含 11 个用户习惯节，检索总指向 HARNESS。按 Harness解耦与反漂移 出 decouplePlan，不毁 ADR 历史。
```
