# 扩展场景：ADM 矩阵验收污染

多次 Agent 预翻译 + 术语学习「确认」会导致 ADM 6 路径塌缩为「全 exact / grep + 65%」。本模式 **adm_matrix_reset** 做轻量还原，**不 DROP 整库**。

## 污染链

```mermaid
sequenceDiagram
  participant PT as PreTranslateGraph
  participant WB as t_translate_workbench
  participant GL as t_translate_glossary
  participant TW as term_word
  participant UI as 术语学习确认

  PT -->|auto_approved| WB
  PT -->|needs_human| UI
  UI -->|approved merge_to_store| GL
  GL --> TW
  Note over TW: 下次预翻译 RAG exact / Grep 整句命中
```

## 症状

- 术语学习 pending 全是 `grep` + `基于混合检索` + 0.65
- 或多次预翻译后全部 `exact` / `term` / `auto_approved`
- `verify_adm_pretranslate --strict` 中 S02/decomposed/T99 行 FAIL

## 清理范围

| 表 | 动作 | 保留 |
|----|------|------|
| `term_agent_audit` | DELETE ADM/T99/触发句 | 非 ADM 业务 audit |
| `t_translate` | 软删误审定整句；触发句 reset state→0 | R01/R04、3B/S03 子句种子 |
| `term_word` | deprecate 整句 ADM | `adm-lexeme-*`、`adm-grep-r04-en` |
| Trie 缓存 | Agent 内 clear | — |

### 必须无 translate_state=3 的触发句

- `ADM/S02-RAG模糊-用户管理系统`
- `文件、系统、资源` / `文件与系统`
- `T99-全新未收录`

## 6 条验收矩阵（verify_adm_pretranslate --strict）

| 词条 | retrieval | source | review |
|------|-----------|--------|--------|
| ADM/R01-RAG精确 | exact | term | auto_approved |
| ADM/R04-RAGGREP一致 | exact | term | auto_approved |
| ADM/S02-RAG模糊-用户管理系统 | fuzzy/none | llm/term | needs_human |
| 文件、系统、资源 | decomposed | hybrid | needs_human/auto_approved |
| 文件与系统 | decomposed | hybrid | needs_human/auto_approved |
| T99-全新未收录 | none | llm | needs_human |

## 一键还原

```powershell
& "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库\scripts\reset-adm-matrix.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Apply
```

或自然语言：`使用 $db-回滚数据库 回滚测试用的 ADM 术语，替我清理数据库`

编排：[[../intention-skills/编排-ADM验收数据还原/SKILL.md]]

## 禁止

- **`python -m scripts.build_word_index --rebuild`** — 会 truncate term_word，需重跑 fix_adm 且可能引入全库噪声
- 对 decomposed/S02/T99 触发句在术语学习「确认入库」— 会再次污染

## 与 audit_rollback / restore 选型

| 场景 | 模式 |
|------|------|
| 本地测试操作多、可接受全库覆盖 | backup + restore |
| 只撤销几条术语同意 | audit_rollback |
| ADM 路径观测 / 多次预翻译后矩阵塌缩 | **adm_matrix_reset** |

## 源码

- [`cleanup_adm_test_data.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/cleanup_adm_test_data.py)
- [`fix_adm_test_data.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/fix_adm_test_data.py)
- [`verify_adm_data.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/verify_adm_data.py)
- [`verify_adm_pretranslate.py`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/verify_adm_pretranslate.py)
