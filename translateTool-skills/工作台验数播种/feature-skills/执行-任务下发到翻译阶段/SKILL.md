---
name: 执行-任务下发到翻译阶段
description: 当需要关联任务与产品、回填词条到任务，并置 entry_state=3 进入工作台翻译阶段时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, dispatch]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

完成「下发」闭环：任务↔产品↔词条关联，词条回填 `task_id`，状态进入**翻译**（非新建）。

## 何时触发

- `编排-工作台验数就绪` 步骤 4
- getTaskPending 因 `entry_state=0` 报系统服务异常（修复数据）

## 输入 / 前置条件

- `taskId` / `productId`
- 词条 id 列表
- `targetLang` → 列名映射（英文 → `en_trans_id`）
- [[../../references/任务人员与词条状态机.md]]

## 必做写入

1. **`t_task_info.product_id`** = 产品 id（若尚未写）
2. **`t_entry_info.task_id`** = 任务 id（回填）
3. **`t_product_relation`**：每词条一行 `(entry_id, product_id, task_id)`
4. **`t_entry_info.entry_state = 3`**（词条审核通过）
5. **目标语种 `*_trans_id = NULL`**（待译）；勿挂未审译文除非场景需要

### 禁止

- `entry_state = 0`（新建）→ `TaskStateEntity.convertFrom` 抛错 → 前端 `/taskManage/getTaskPending` `code:201`「系统服务异常」

## 执行方式

优先整包种子：

```powershell
& "<skillRoot>\scripts\apply-workbench-verify-seed.ps1" -ProjectRoot "<ProjectRoot>" -SeedProfile syk_glossary
```

仅修状态时：

```sql
UPDATE t_entry_info
SET entry_state = 3, task_id = '<taskId>', en_trans_id = NULL
WHERE id IN (...);

-- 确保 relation 存在（按 id 幂等 INSERT）
```

## 失败模式

| 触发 | 一线修复 | 仍失败 |
|------|----------|--------|
| getTaskPending 201 + 词条 state=0 | UPDATE `entry_state=3` | 查是否另有 state=0 挂同任务 |
| relation 缺失 | 补 `t_product_relation` | 核对 entry/product/task 三键 |
| 人员为空导致 UI 无任务 | 回 `执行-创建验数任务` | Human Loop |
| 误设 en_trans_id 非空导致不进待译 | 置 NULL（待译场景） | 确认是否测改译而非待译 |

## 输出 dispatchResult

| 字段 | 说明 |
|------|------|
| `relationCount` | |
| `entryStateOk` | 任务下无 entry_state=0 |
| `pendingTranslateReady` | state=3 且目标 trans_id 空 |

## 边界

- 不跑 UI；验证交给 `验证-翻译阶段就绪`
- 不修改 Java `TaskStateEntity`（数据侧规避）

## 使用示例

```text
任务 verify-syk-admin-task：4 词条写 relation、task_id 回填、entry_state=3、en_trans_id 空。
```
