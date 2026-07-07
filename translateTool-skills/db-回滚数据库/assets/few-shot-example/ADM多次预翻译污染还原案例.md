# ADM 多次预翻译污染还原案例

路径：`translateTool-skills/db-回滚数据库` · 模式：`adm_matrix_reset`

## 用户请求

```text
因为多次预翻译，术语库里都存住了那些本应体现为多种 retrieval_method 的场景，
导致大多数都能用基于术语库的方法来命中。替我清理数据库，然后再验证验收结果。
```

## Agent 正确行为

1. **分析-回滚模式判定** → `adm_matrix_reset`（非 restore、非 audit）
2. **实际执行**（非只输出 SQL）：

```powershell
& "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库\scripts\reset-adm-matrix.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Apply
```

3. 汇报摘要 + UI 复测清单

## 实测摘要（2026-07-07）

| 步骤 | 结果 |
|------|------|
| cleanup | 删 45 条 term_agent_audit；软删 6 条 ADM 误审定 t_translate；deprecate 12 条 term_word |
| fix_adm | 词片种子 + comment 隔离 OK |
| verify_adm_data --strict | All passed |
| verify_adm_pretranslate --strict | 6 行 OK |

## 错误行为（勿模仿）

- 只解释 SQL 表结构不执行
- 误走整库 restore（用户未要求）
- 跑 `build_word_index --rebuild`
- cleanup 后未 fix_adm / verify

## UI 收尾

1. 术语学习「清除本地 Mock」
2. 重启 terminology-agent
3. admin-proj 6 场景各预翻译一次
