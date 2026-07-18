---
name: 设计-验数词条矩阵
description: 当需要设计工作台/术语库验数词条（命中对照、前缀、comment）并与 t_translate 种子对齐时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, design]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

产出可执行的 `entryMatrix`：原文、预期命中、id 前缀、是否需要术语库 `t_translate` state=3 种子。

## 何时触发

- `编排-工作台验数就绪` 步骤 2
- `seedProfile=custom` 或用户要改测法

## 输入 / 前置条件

- `seedProfile` / `targetLang` / `department`
- 测试目的：`syk_glossary`（术语库精确命中）| `adm_matrix`（Agent 多检索）| `custom`

## 设计规则

1. **对照原则**：至少 1 条应命中 + 1 条不应命中（miss），避免「全绿假阳性」
2. **原文前缀**：
   - SYK：`VERIFY/SYK-exact-*` / `VERIFY/SYK-miss-*`
   - ADM：沿用 `ADM/R01-…`、`ADM/S02-…`、`T99-…` 等既有矩阵
3. **术语库命中行**：同步设计 `t_translate`（`translate_state='3'`、`visual_range=department`、译文带可肉眼识别前缀如 `SYK-HIT-`）
4. **工作台待译行**：目标语种 `*_trans_id` 计划为 NULL；`entry_state` 计划为 **3**（本步只设计，写入在步骤 4）
5. **comment**：Agent 场景可用 `ADM-S02` / `ADM-T99` 等便于 audit 过滤

### syk_glossary 默认矩阵（4 行）

| entry 原文 | 术语库译文 | 说明 |
|------------|------------|------|
| `VERIFY/SYK-exact-用户登录` | `SYK-HIT-User Login` | 命中 |
| `VERIFY/SYK-exact-权限管理` | `SYK-HIT-Permission Mgmt` | 命中 |
| `VERIFY/SYK-exact-数据备份` | `SYK-HIT-Data Backup` | 命中 |
| `VERIFY/SYK-miss-全新句子XYZ` | （无） | 未命中对照 |

详见 [[../../assets/few-shot-example/产品admin-SYK验数就绪.md]]

## 失败模式

| 触发 | 一线修复 | 仍失败 |
|------|----------|--------|
| 只有命中无 miss | 补 1 条 miss | 用户拒绝 → 在卡上标注风险 |
| 译文无可辨前缀 | 加 `SYK-HIT-` 等前缀 | Human Loop |
| 与库内已有原文冲突 | 改前缀或 id | 换 seed 命名空间 |

## 输出 entryMatrix

| 字段 | 说明 |
|------|------|
| `rows[]` | id、entry、needGlossaryHit、glossaryTranslate、comment |
| `expectedEntryCount` | |
| `glossarySeedCount` | 需 INSERT 的 state=3 行数 |

## 边界

- 本节点**默认不写库**（只出矩阵）；种子档案可声明「沿用 SQL 矩阵」并输出 `reusedSeedMatrix=true`
- 不负责 `t_product_relation` / `entry_state` 落地

## 使用示例

```text
设计术语库翻译验数：3 命中 + 1 miss，部门通用平台部，英文。
```
