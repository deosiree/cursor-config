---
name: 验证-翻译阶段就绪
description: 当需要用 SQL 验收验数任务已五人员齐填、relation 正确、词条 entry_state=3 可进翻译阶段时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, verify]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

跑固定验收查询，输出 `verifyPassed` 与 UI 开测路径；任一项失败则列出 FAIL 行。

## 何时触发

- `编排-工作台验数就绪` 步骤 5（强制）
- 用户怀疑 getTaskPending 仍异常

## 输入 / 前置条件

- `taskId` / `productId`
- `expectedEntryCount`（已知则严格相等）
- `targetLang`（默认英文 → `en_trans_id`）

## 验收项（全部通过才算绿）

1. **五人员非空**：`t_task_info` 上 creator/developer/entry_auditor/translator/translation_auditor
2. **relation**：`t_product_relation` 中 `task_id` 行数 = 预期；`product_id` 正确
3. **翻译阶段**：关联词条 `entry_state=3`，目标 `*_trans_id IS NULL`
4. **无新建态**：该任务下 `entry_state=0` 计数 = 0
5. **（可选）术语库种子**：命中原文在 `t_translate` 且 `translate_state='3'`

### 示例查询

```sql
-- 1 人员
SELECT id, creator, developer, entry_auditor, translator, translation_auditor, product_id
FROM t_task_info WHERE id = '<taskId>';

-- 2 relation
SELECT COUNT(*) FROM t_product_relation WHERE task_id = '<taskId>' AND product_id = '<productId>';

-- 3+4 词条态
SELECT e.id, e.entry_state, e.en_trans_id, e.task_id
FROM t_entry_info e
JOIN t_product_relation r ON r.entry_id = e.id
WHERE r.task_id = '<taskId>';

SELECT COUNT(*) AS bad_new FROM t_entry_info e
JOIN t_product_relation r ON r.entry_id = e.id
WHERE r.task_id = '<taskId>' AND e.entry_state = 0;
```

执行：优先一键脚本（exit 0/1）：

```powershell
$skillRoot = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\工作台验数播种"
& "$skillRoot\scripts\verify-workbench-translate-ready.ps1" `
  -ProjectRoot "<ProjectRoot>" `
  -TaskId "<taskId>" `
  -ProductId "<productId>" `
  -ExpectedEntryCount 4
```

也可 `docker exec … mysql … -e` 手跑上方查询。Agent 须实际执行脚本，不得只贴命令。

## 失败模式

| 触发 | 一线修复 | 仍失败 |
|------|----------|--------|
| bad_new > 0 | 调步骤 4 置 state=3 | STOP 贴 FAIL 行 |
| relation 数不对 | 补/删 relation | Human Loop |
| 人员有 NULL | 调步骤 1 | Human Loop |
| verify 绿但 UI 仍 201 | 查是否请求了**其他**任务 id 仍含 state=0 | 扩大排查范围 |

## 输出 verifyResult

| 字段 | 说明 |
|------|------|
| `verifyPassed` | bool |
| `failItems[]` | 未通过项 |
| `uiPath` | 产品 → 任务 → 翻译 |
| `cardSummary` | 词条与预期命中摘要 |

## 边界

- 不自动 backup/restore
- 不替代用户肉眼点「术语库」翻译；只保证数据侧可进阶段

## 使用示例

```text
验收 verify-syk-admin-task：人员、relation=4、无 entry_state=0、待译 en_trans_id 空。
```
