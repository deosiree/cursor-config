---
name: 执行-ADM种子重建
description: 调用 terminology-agent devtools.fix_adm_test_data --apply，恢复词片种子、entry 对齐、comment 隔离。
version: 1.2.0
tags: [db-回滚数据库, translateTool-skills, adm, execute]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

cleanup 之后重建 ADM 验收所需种子数据。

## 何时触发

- `编排-ADM验收数据还原` 步骤 4（cleanup apply 之后）

## 输入 / 前置条件

- cleanup 已成功 apply（或 DB 已知干净）

## 执行命令

cwd = `{ProjectRoot}/terminology-agent`：

```powershell
cd "<ProjectRoot>\terminology-agent"
python -m devtools.fix_adm_test_data --apply
```

## 脚本行为摘要

- visual_range 修复（ADM/% 已审定英文 → `通用平台部`）
- entry / t_translate / term_word 重命名对齐
- 词片种子：`文件`/`系统`/`资源`（comment="" department 唯一）
- 整句 Grep 种子：R04
- S02/T99 entry comment 隔离：`ADM-S02`、`ADM-T99`

源码：[`fix_adm_test_data.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/fix_adm_test_data.py)

## 输出

- `seedApplied`：exit code 0
- 触发/种子校验 OK/MISSING 行

## 边界

- 必须在 cleanup apply 之后执行
- 不跑 verify（下一步 feature skill）
