---
name: 执行-创建验数任务
description: 当需要 INSERT/更新 t_task_info 验数任务且五人员字段必须齐填时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, task]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

写入或覆盖验数任务行，**五人员字段一律非空**。

## 何时触发

- `编排-工作台验数就绪` 步骤 1
- 用户要求「补任务人员」

## 输入 / 前置条件

- `taskId` / `taskName`
- `productId`
- `department` / `targetLang`（写入 `translate_type`）
- `personnel`：本地默认五字段均为 `admin`
- 真源说明：[[../../references/任务人员与词条状态机.md]]

## 必填字段（缺一不可）

| 字段 | 含义 | 本地验数默认 |
|------|------|--------------|
| `creator` | 创建人 | `admin` |
| `developer` | 开发员 | `admin` |
| `entry_auditor` | 词条审核员 | `admin` |
| `translator` | 翻译员 | `admin` |
| `translation_auditor` | 翻译审核员 | `admin` |

另需：`product_id`、`department`、`translate_type`、`state`（进行中常用 `1`）、`is_delete=0`。

## 执行方式

**优先**：走种子 SQL（含任务段），见 `apply-workbench-verify-seed.ps1`。

**手工补丁**（人员漏填时）：

```sql
UPDATE t_task_info
SET creator='admin', developer='admin', entry_auditor='admin',
    translator='admin', translation_auditor='admin',
    product_id='<productId>'
WHERE id='<taskId>';
```

执行通道：`docker cp` + 容器内 `mysql`；禁止 PowerShell 管道灌 SQL。

## 失败模式

| 触发 | 一线修复 | 仍失败 |
|------|----------|--------|
| 只写了 creator | 补齐其余四字段 | STOP 问用户角色账号 |
| product_id 为空 | 写入 verifyTarget.productId | 产品不存在 → 回分析节点 |
| 任务 id 冲突且用户要保留旧任务 | 换 taskId 或先确认 DELETE | Human Loop |

## 输出 taskCreateResult

| 字段 | 说明 |
|------|------|
| `taskId` / `taskName` | |
| `personnelFilled` | 五字段均非空则为 true |
| `productId` | |

## 边界

- 不写 `t_entry_info` / `t_product_relation`（后续 feature）
- 禁止「只填 creator 凑合能开任务页」

## 使用示例

```text
创建任务 verify-syk-admin，挂产品 admin，五人员全 admin。
```
