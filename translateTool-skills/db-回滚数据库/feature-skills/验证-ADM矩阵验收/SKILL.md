---
name: 验证-ADM矩阵验收
description: 运行 verify_adm_data 与 verify_adm_pretranslate --strict，确认 6 条检索路径矩阵通过。
version: 1.2.0
tags: [db-回滚数据库, translateTool-skills, adm, verify]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

strict 验收 ADM 数据与 PreTranslateGraph 矩阵。

## 何时触发

- `编排-ADM验收数据还原` 步骤 5（fix_adm 之后）

## 执行命令

cwd = `{ProjectRoot}/terminology-agent`：

```powershell
cd "<ProjectRoot>\terminology-agent"
python -m devtools.verify_adm_data --strict
python -m devtools.verify_adm_pretranslate --strict
```

任一 exit code ≠ 0 → **停止编排**，不宣称验收通过。

## 期望结果

### verify_adm_data

- R01/R04、3B/S03 子句种子存在
- 词片 `文件/系统/资源` department 唯一
- jieba 切分 `文件、系统、资源` / `文件与系统` OK

### verify_adm_pretranslate（6 行）

| 词条 | retrieval | source | review |
|------|-----------|--------|--------|
| ADM/R01-RAG精确 | exact | term | auto_approved |
| ADM/R04-RAGGREP一致 | exact | term | auto_approved |
| ADM/S02-RAG模糊-用户管理系统 | none/fuzzy | llm/term | needs_human |
| 文件、系统、资源 | decomposed | hybrid | needs_human/auto_approved |
| 文件与系统 | decomposed | hybrid | needs_human/auto_approved |
| T99-全新未收录 | none | llm | needs_human |

详见：[`template/after/ADM矩阵还原后状态.md`](../../template/after/ADM矩阵还原后状态.md)

## 失败处理

- FAIL 行写入 `verificationReport.failures`
- 提示：重启 terminology-agent 后重跑 verify
- 仍 FAIL → 查 `扩展场景-ADM矩阵验收污染.md`

## 输出

- `verifyDataPassed` / `verifyPretranslatePassed`（bool）
- `matrixTable`（6 行摘要）
