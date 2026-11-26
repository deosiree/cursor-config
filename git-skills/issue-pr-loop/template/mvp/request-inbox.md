# 需求候选池：<项目名>

此文件记录尚未决定是否进入 GitHub 的建议。`request-inbox.md` 是候选池，不代替 Issue，也不授权实现。

## 仓库与核对范围

- 仓库：`<owner/repo 或本地路径>`
- 当前分支/工作树：`<分支、干净或脏改动摘要>`
- 已读需求/契约：`<文件或 none-found>`
- 已查 Issue/PR：`<开放/关闭范围、查询时间或 unknown>`
- 上次批量评审：`<日期或 never>`

## 候选索引

| Candidate ID | 来源/收到时间 | 摘要 | 分类 | 重复状态 | Readiness | 决定/Issue |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | `<来源 / 日期>` | `<可观察问题或期望结果>` | `needs-verification` | `unknown` | `needs-info` | `pending` |

分类：`bug`、`feature`、`maintenance`、`research`、`needs-verification`。只有现状违反已接受契约且有证据时才使用 `bug`。

Readiness：`needs-info`、`ready-for-review`、`approved-to-publish`、`published`、`deferred`、`declined`。不要把 `ready-for-review` 当作实现授权。

## 候选详情

### R-01：<短标题>

- 原始反馈：`<保留必要原意，不写成确认的需求>`
- 来源：`<角色/渠道>`
- 当前观察：`<实际表现、复现条件或 not-verified>`
- 需求/契约证据：`<文件、Issue、验收条件，或 none-found>`
- 代码/测试证据：`<路径与符号/行号；区分观察和推断>`
- 分类与理由：`<类型及证据>`
- 影响：`<用户/流程/风险；未知就写 unknown>`
- 重复检查：`<相似 Issue/PR URL 或检查范围和结果>`
- 依赖/关系：`<blocked_by、related、候选合并/拆分>`
- 待澄清：`<只列会改变范围、行为或验收的问题>`
- readiness：`<needs-info / ready-for-review / approved-to-publish 等>`
- 决策：`<keep / merge / split / defer / duplicate / decline>`
- 决策理由：`<由维护者确认的理由>`
- Issue 映射：`<未发布 / #number + URL>`
- owner/优先级/日期：`<confirmed value 或 unassigned / unranked / unscheduled>`

## 批次记录

| 日期 | 处理的 Candidate IDs | 合并/拆分/延后/拒绝 | 用户选择 | 发布核对 |
| --- | --- | --- | --- | --- |
| `<日期>` | `R-01` | `<处理与理由>` | `<confirmed / pending>` | `<实际 Issue URL 或 not-published>` |
