---
name: 分析-验数目标确认
description: 当工作台验数播种开始前，需收齐产品、任务、语种、种子档案并判定能否写库时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, analyze]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

确认验数目标事实，输出结构化 `verifyTarget`；关键事实缺失则 **STOP** 询问，不写库。

## 何时触发

- 主 skill `工作台验数播种` 入口第一步
- 用户只说「给 admin 灌词条」但未给 productId / seedProfile

## 输入 / 前置条件

- 用户自然语言或已有部分字段
- `ProjectRoot` 可解析（默认见主 SKILL）

## 执行步骤

1. 解析或询问：
   - `productId` 或 `productName`（至少一个）
   - `taskName` / `taskId`（可缺省：按 seedProfile 用种子默认）
   - `targetLang`（默认 `英文`）
   - `department`（默认 `通用平台部`）
   - `seedProfile`：`syk_glossary` | `adm_matrix` | `custom` | `admin_retrieval`（多检索 6 路径）
   - `doBackup` / `dryRun` / `dbTarget`
2. 若仅有 `productName`：在库中查询 `t_entry_classify`（type=product）或产品表；**多于 1 行 → STOP 让用户选 id**
3. 映射种子文件：
   - `syk_glossary` → `db/opt/seed-verify-syk-admin-product.sql`（须与 productId 一致或先改 SQL 变量）
   - `adm_matrix` → `db/opt/seed-verify-term-syk.sql`
   - `custom` → 默认骨架 [[../../template/custom-matrix.md]] + [[../../template/custom-seed.example.sql]]  
     若用户未给现成 SQL：用 `new-custom-seed.ps1` 生成 `db/opt/seed-verify-custom-<slug>.sql`，再改矩阵行；  
     `seedSqlPath` 写入 verifyTarget（custom **必填**）
   - `admin_retrieval` → ProjectRoot `db/opt/seed-verify-admin-retrieval.sql`（当作 custom + 固定 SeedSqlPath；expectedEntryCount=6）
4. 输出 `verifyTarget`，路由到 `编排-工作台验数就绪`

## 输出 verifyTarget

| 字段 | 说明 |
|------|------|
| `ProjectRoot` | 绝对路径 |
| `productId` / `productName` | 已确认 |
| `taskId` / `taskName` | 已确认或种子默认 |
| `targetLang` / `department` | |
| `seedProfile` / `seedSqlPath` | |
| `personnelDefault` | 本地默认 `admin` |
| `doBackup` / `dryRun` / `dbTarget` | |
| `expectedEntryCount` | 已知则填（syk_glossary=4） |
| `blockedReason` | 非空则禁止进入编排写库 |

## 人工门禁

🔴 CHECKPOINT · 🛑 STOP：下列任一成立时**禁止**进入编排写库，先问用户。

| 条件 | 动作 |
|------|------|
| 无 product 且无法唯一解析 | `blockedReason=need_product`，停问 |
| `seedProfile=custom` 且无 `seedSqlPath`、又拒绝用模板生成 | `blockedReason=need_custom_matrix`；提示先跑 `new-custom-seed.ps1` |
| `dbTarget=remote` | 允许继续编排，但只输出命令 |

## 边界

- 不 INSERT/UPDATE
- 不调用备份脚本（由编排决定）

## 使用示例

```text
用户：给产品 admin 准备术语库翻译验数。
→ 查 productId，seedProfile=syk_glossary，输出 verifyTarget 后进编排。
```
