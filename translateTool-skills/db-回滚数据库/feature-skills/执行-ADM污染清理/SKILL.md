---
name: 执行-ADM污染清理
description: 调用 terminology-agent devtools.cleanup_adm_test_data，删除 ADM audit、软删误审定 translate、deprecate term_word 整句污染。
version: 1.2.0
tags: [db-回滚数据库, translateTool-skills, adm, execute]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

运行 `cleanup_adm_test_data`，移除多次预翻译/术语学习入库造成的「全变 exact」污染。

## 何时触发

- `编排-ADM验收数据还原` 步骤 1（dry-run）或步骤 3（apply）

## 输入 / 前置条件

- `ProjectRoot`：translationtool 根目录
- `apply`：`false` → `--dry-run`（默认 preview）；`true` → `--apply`

## 执行命令

**必须在 shell 实际执行**，cwd = `{ProjectRoot}/terminology-agent`：

```powershell
cd "<ProjectRoot>\terminology-agent"
python -m devtools.cleanup_adm_test_data --dry-run   # apply=false
python -m devtools.cleanup_adm_test_data --apply     # apply=true
```

## 脚本行为摘要

| 步骤 | 表 | 动作 |
|------|-----|------|
| 1 | `term_agent_audit` | DELETE ADM/T99/触发句相关 |
| 2 | `t_translate` | 软删误审定整句；触发句 reset state→0 |
| 3 | `term_word` | deprecate 整句 ADM（保留 adm-lexeme-* / adm-grep-r04-en） |
| 4 | Trie | `clear_trie_cache()` |

保留审定：`ADM/R01-RAG精确`、`ADM/R04-RAGGREP一致`、3B/S03 子句种子。

源码：[`cleanup_adm_test_data.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/cleanup_adm_test_data.py)

## 输出

- `cleanupSummary`：stdout 中的待删/已删行数摘要
- `exitCode`：0 成功

## 边界

- 不跑 fix_adm / verify（由后续 feature skill 负责）
- remote 且无授权 → 只输出命令
