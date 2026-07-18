---
name: 工作台验数播种
description: 为 translationtool 工作台准备可测任务：创建任务（五人员齐填）、设计验数词条、挂到产品、下发并回填进翻译阶段。触发词：工作台验数、灌测产品、创建验数任务、人员五字段、词条进翻译阶段、getTaskPending 系统服务异常、产品 admin 挂词条、任务下发/回填。
version: 1.3.0
tags: [translationtool, workbench, verify, seed, task, entry_state, translateTool-skills]
metadata:
  darwin:
    parent_skill: 工作台验数播种
    last_eval: 2026-07-18
    eval_mode: full_test
    baseline_score: 78.5
    round1_score: 84.6
    round2_score: 84.9
    round3_score: 85.5
    round4_score: 88.1
    final_score: 88.1
    rounds: 4
    hl4_reached: true
    hl4_note: "HL-4 after round3; user requested continue dim7 → round4 keep +2.6"
    stop_reason: "round4 dim7 custom architecture closed; see DARWIN_BASELINE.md"
should-trigger:
  - 工作台验数 / 灌测产品 / 给产品挂验数词条
  - 创建验数任务 / 任务人员五字段
  - 词条进翻译阶段 / 任务下发回填
  - getTaskPending 报系统服务异常且怀疑 entry_state=0
  - 产品 admin + 术语库翻译验数就绪
should-not-trigger:
  - 整库 backup / restore / keep_classify → db-回滚数据库
  - ADM 矩阵污染清理 + strict 验收（不含建任务）→ db-回滚数据库 编排-ADM验收数据还原
  - 改 Java / Vue 业务代码
  - 生产库无授权写入
---

# 目标

把「验数任务就绪到工作台翻译阶段」标准化为可路由套件：

1. 确认目标（产品 / 任务 / 语种 / 种子档案）
2. 编排：可选备份 → 建任务 → 设计词条 → 挂产品 → 下发进翻译 → 验证
3. 输出验数卡，供用户在 UI 开测

## 何时使用

- 本地要测术语库翻译 / 预翻译，需要产品下有任务且词条在**翻译**阶段
- 新建或重灌验数任务，怕漏人员字段或 `entry_state`
- `/taskManage/getTaskPending` 因新建态词条报 `code:201`

## 何时不要使用

- 只要备份/回滚库 → `db-回滚数据库`
- 只要 ADM cleanup + `reset-adm-matrix` → `db-回滚数据库`（本套件可在其后补「翻译阶段就绪」）
- 无产品 id/名、且库里无法唯一解析产品 → 先问清再写库

## 输入契约

| 字段 | 说明 | 默认 |
|------|------|------|
| `ProjectRoot` | translationtool 根目录 | `F:/Documents/Repertory/Sieyuan/translationtool` |
| `productId` / `productName` | 目标产品（至少一个） | 无 |
| `taskName` / `taskId` | 验数任务名/id | 按种子档案 |
| `targetLang` | 语种（如 `英文`） | `英文` |
| `department` | 部门 | `通用平台部` |
| `seedProfile` | `syk_glossary` / `adm_matrix` / `custom` | `syk_glossary` |
| `doBackup` | 写库前是否委托备份 | `true`（破坏性重灌时） |
| `dbTarget` | `local-docker` / `remote` | `local-docker` |
| `dryRun` | 只规划不写库 | 用户说「先看看」时为 true |

## 路由（Single Dispatch）

```text
1. [[intention-skills/分析-验数目标确认/SKILL.md]]
2. [[intention-skills/编排-工作台验数就绪/SKILL.md]]
   → 顺序调用 feature（见编排内步骤）
3. 输出 [[assets/skill-output-checklist.md]]
```

### Feature 一览

| 步骤 | Feature |
|------|---------|
| 1 建任务 | [[feature-skills/执行-创建验数任务/SKILL.md]] |
| 2 设计词条 | [[feature-skills/设计-验数词条矩阵/SKILL.md]] |
| 3 挂产品 | [[feature-skills/执行-产品挂载词条/SKILL.md]] |
| 4 下发进翻译 | [[feature-skills/执行-任务下发到翻译阶段/SKILL.md]] |
| 验收 | [[feature-skills/验证-翻译阶段就绪/SKILL.md]] |

## 硬约束（摘要）

完整真源：[[references/任务人员与词条状态机.md]]；项目侧：`docs/ops/DEV_DB_CHECKPOINT.md`。

- `t_task_info` 五人员必填：`creator` / `developer` / `entry_auditor` / `translator` / `translation_auditor`
- 进翻译：`entry_state=3`，目标语种 `*_trans_id IS NULL`；禁止 `entry_state=0`
- SQL 执行：`docker cp` + 容器内 `mysql < file`；禁止 PowerShell 管道写 SQL/dump

## 种子真源（不进 skill 正文复制大段 SQL）

| seedProfile | 路径（相对 ProjectRoot） |
|-------------|--------------------------|
| `syk_glossary`（产品 admin） | `db/opt/seed-verify-syk-admin-product.sql` |
| `adm_matrix` / 旧 qt(ts) | `db/opt/seed-verify-term-syk.sql` |
| `custom` | 先 [[template/custom-matrix.md]] → [[scripts/new-custom-seed.ps1]] → `db/opt/seed-verify-custom-<slug>.sql`（骨架见 [[template/custom-seed.example.sql]]） |

一键灌数：[[scripts/apply-workbench-verify-seed.ps1]]（custom 须 `-SeedSqlPath`）  
一键验收：[[scripts/verify-workbench-translate-ready.ps1]]（exit 0/1）

## 人工门禁

🔴 CHECKPOINT · 🛑 STOP：下列任一成立时**禁止写库**，先问用户或只输出命令。

| 条件 | 动作 |
|------|------|
| 缺 product 且无法唯一解析 | 停止询问 |
| `dbTarget=remote` | 只输出命令，不 execute |
| 破坏性 DELETE 旧 verify-* | 先 backup 或用户明确「替我执行」 |
| `dryRun=true` | 只输出计划与 SQL 路径 |
| `verify-workbench-translate-ready.ps1` exit 1 | 贴 FAIL 行，不得声称翻译阶段就绪 |

## 反例黑名单（不要做）

| # | 不要 | 原因 |
|---|------|------|
| 1 | 只填 `creator`，其余人员 NULL | UI 任务流/权限过滤异常 |
| 2 | 种子 `entry_state=0` 进翻译验数 | `getTaskPending` → 201 系统服务异常 |
| 3 | 把术语库命中行的 `t_translate.id` 写进 `en_trans_id`（待译测术语库时） | 工作台已非待译，测法变味 |
| 4 | PowerShell 管道/`Set-Content` 灌 SQL 或 mysqldump | 编码损坏（与 db-回滚红灯相同） |
| 5 | 无 `t_product_relation` 却声称已下发 | 词条未挂任务，工作台列表空/错 |
| 6 | 本套件里做整库 DROP/restore | 走 `db-回滚数据库` |
| 7 | verify 脚本 exit 1 仍告诉用户「可以开测」 | 违反验收门禁 |

## Darwin

- 见 `results.tsv` / `DARWIN_BASELINE.md`；Phase2 记录在 frontmatter `metadata.darwin`

## 使用示例

```text
给产品 admin 灌术语库翻译验数：建任务（人员全填）、挂词条、下发到翻译阶段，测前先备份。
使用 $工作台验数播种，seedProfile=syk_glossary。
```
