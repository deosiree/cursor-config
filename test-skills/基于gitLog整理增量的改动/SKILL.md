---
name: 基于gitLog整理增量的改动
description: >-
  多仓 git log 抽取、域名双轨标注、主题级问题树、中文 Excel 邻接表导出。
  默认 Nebula/惠岩；跨项目先 harness intake 与用户确认 author/主域/主责人。
  何时用：0707-0807 提交整理、内测问题单、增量 gitLog Excel。
  何时不用：改业务源码、写 CSV 用例、后端 pytest。
  触发词：gitLog整理、提交增量、问题树Excel、域名标注、主题聚类、0707-0807。
---

# 基于 gitLog 整理增量改动（父 Agent）

## 目标

将指定作者在时间窗内的非 Merge 提交整理为 **主题级问题树 Excel**（节点表 + 域名字典 + 使用说明）。

黄金样本：`assets/few-shot-example/nebula-0707-0807/`（106 提交、29 问题根，内嵌拷贝）。

## 何时使用

- 整理某作者多仓 git log → 内测问题单 / 增量回顾
- 需要「是否主域」与协作域（路由/国际化）双轨标注
- 主题聚类（非域名级问题根）

## 何时不要使用

- 写 CSV 测试用例 → `../输出csv的测试用例/SKILL.md`
- 后端 pytest → `../基于测试用例写后端的pytest自动化测试/SKILL.md`
- 直接改业务源码或 harness `docs/`

## Agent 工作循环

| 步 | 动作 |
| --- | --- |
| RED | 核对输入契约；跨项目 → dispatch 分析 intention |
| CHECKPOINT | 属性未确认 → STOP |
| GREEN | Single Dispatch → `策略-整理gitLog增量` |
| REFACTOR | 跑 `verify_output.py`；对照 acceptance；可选 Darwin |

### 输入契约

| 字段 | 默认 | 跨项目 |
| --- | --- | --- |
| `targetRepoProfile` | `nebula-huiyan` | 新建或指定 |
| `author` | 惠岩 | harness + **用户确认** |
| `since` | 2026-07-07 | 用户指定 |
| `outDir` | humanDocs/自测单/gitLog | 用户指定 |
| `xlsxName` | 0707-0807.xlsx | 用户指定 |
| `allowDarwin` | false | true 时 REFACTOR |

缺字段 → `missingFacts`，**禁止**跑脚本。

**🔴 CHECKPOINT · RED 结束**：`profile != nebula-huiyan` 且未完成 harness 属性确认 → STOP。

### GREEN 路由（Single Dispatch）

| 条件 | intention |
| --- | --- |
| 跨项目 / 缺 profile | `intention-skills/分析-项目属性与harness/SKILL.md` |
| 属性已齐 / 默认 Nebula | `intention-skills/策略-整理gitLog增量/SKILL.md` |

**禁止**一轮 dispatch 多个 intention。

### REFACTOR

- `python scripts/verify_output.py --config configs/{profile}.config.json`
- 对照 `assets/few-shot-example/nebula-0707-0807/after/acceptance.md`
- `allowDarwin=true` → `feature-skills/darwin质量评估与迭代/SKILL.md`

**🔴 CHECKPOINT · REFACTOR**：`verify_output` 退出码非 0 → **STOP**，不宣称完成。

## 失败模式

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 缺 author/repos | 输出 missingFacts | STOP |
| harness 无主责人 | AskQuestion | 不猜协作人 |
| raw 与 Excel 提交数不等 | 重跑 extract+build | 对照 acceptance |
| expect 漂移（106 vs 105） | 见 `质量-输出验收` | CHECKPOINT 重基线 |
| 问题根=域名标签 | 查 theme-cluster-rules | 禁止 mega 合并 |
| xlsx 被占用 | 关 Excel 重跑 | 改 xlsxName |

## 不要做什么

1. 不把域名标签当问题根
2. 不因非主域删提交
3. 不把产出写进 harness `docs/`
4. 不用仓外路径引用 few-shot（只用 `assets/...`）
5. 不在父 SKILL 内嵌 Python/正则（见 scripts + configs）

## 使用示例

```text
使用 $基于gitLog整理增量的改动，profile=nebula-huiyan，since=2026-07-07，重导 Excel。
```

```text
使用 $基于gitLog整理增量的改动，换到其他 Meta-Workspace，先查 harness 跟我确认 author 和主域再跑。
```
