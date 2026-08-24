# 属性确认表模板（跨项目 CHECKPOINT）

复制下表填写，**用户确认前禁止**跑 `extract_commits.py`。

| 属性 | harness 推断 | 用户确认值 | 写入 config 字段 |
| --- | --- | --- | --- |
| profileId | | | `profileId` |
| metaRoot | | | `metaRoot` |
| author（git --author） | | | `author` |
| defaultOwner | | | `defaultOwner` |
| since | | | `since` |
| until（可选） | | | `until` |
| outDir | | | `outDir` |
| xlsxName | | | `xlsxName` |
| repos（仓别名→相对路径） | | | `repos` |
| 主责主域列表 | AGENTS 主域表 | | domain-dict「是否惠岩主责主域=是」 |
| 协作域：路由鉴权 | 杨欣静主责？ | owner / myRole | `collaborators.路由鉴权` |
| 协作域：国际化 | 叶倩主责？ | owner / myRole | `collaborators.国际化` |
| domain-dict 来源 | 复制 nebula 默认再改 | 确认 | `domainDictFile` |
| theme-rules 来源 | 复制 nebula 默认再改 | 确认 | `themeRulesFile` |

## CHECKPOINT 话术

> 请确认上表「用户确认值」列；确认后我将生成 `configs/{profileId}.config.json` 并执行流水线。

## 仍缺字段

记入 `missingFacts`，仅输出追问清单，**STOP**。
