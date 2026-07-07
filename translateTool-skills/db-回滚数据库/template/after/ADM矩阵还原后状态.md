# ADM 矩阵还原后状态（template/after）

`verify_adm_pretranslate --strict` 期望输出摘要。

## verify_adm_data --strict

```
All ADM data checks passed.
```

- R01/R04 t_translate exact 存在
- 3B/S03 子句种子存在
- 词片 文件/系统/资源 department=`通用平台部` 各 1 行 approved
- jieba：`文件、系统、资源` → 文件、系统、资源；`文件与系统` → 文件、系统

## verify_adm_pretranslate --strict

```
词条                                   retrieval    source   review         conf   OK
ADM/R01-RAG精确                        exact        term     auto_approved  1.00   OK
ADM/R04-RAGGREP一致                    exact        term     auto_approved  1.00   OK
ADM/S02-RAG模糊-用户管理系统           none         llm      needs_human    0.65   OK
文件、系统、资源                       decomposed   hybrid   auto_approved  0.88   OK
文件与系统                             decomposed   hybrid   auto_approved  0.88   OK
T99-全新未收录                         none         llm      needs_human    0.65   OK

All ADM matrix cases passed.
```

注：decomposed 行 review 可为 `needs_human` 或 `auto_approved`（compose 成功时 ≥0.88）。

## 术语学习 UI 期望

预翻译一轮后 pending 应出现 **多种** retrieval_method（none / decomposed 等），而非全部 grep+65%。

R01/R04 auto_approved **不应**出现在术语学习 pending。
