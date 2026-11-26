# 需求候选池：<项目名>

此文件记录尚未决定是否进入 GitHub 的建议。`request-inbox.md` 是候选池，不代替 Issue，也不授权实现。

## 仓库与核对范围

- 仓库：`<owner/repo 或本地路径>`
- 当前分支/工作树：`<分支、干净或脏改动摘要>`
- 已读需求/契约：`<文件或 none-found>`
- 已查 Issue/PR：`<开放/关闭范围、查询时间或 unknown>`
- 上次批量评审：`<日期或 never>`

## 候选索引

| Candidate ID | 来源/收到时间 | 摘要 | 分类 | 重复状态 | Workflow status | 决定/Issue |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | `<来源 / 日期>` | `<可观察问题或期望结果>` | `needs-verification` | `unknown` | `captured` | `pending` |

分类：`bug`、`feature`、`maintenance`、`research`、`needs-verification`。只有现状违反已接受契约且有证据时才使用 `bug`。

Issue readiness：`needs-info`、`ready-for-review`。`ready-for-review` 表示草稿信息完整，不代表用户已确认方案或授权实施。

Workflow status：`captured`、`triaging`、`plan-pending-confirmation`、`approved-to-implement`、`in-progress`、`verified`、`blocked`、`deferred`、`declined`。

Issue 发布状态单独记录：`draft`、`authorization-pending`、`not-authorized`、`published` 或已有 Issue URL。方案确认、实现授权和 GitHub 写入授权分别记录，不互相推断。

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
- Issue readiness：`<needs-info / ready-for-review>`
- workflow status：`<captured / triaging / plan-pending-confirmation / approved-to-implement / in-progress / verified / blocked / deferred / declined>`
- Issue 发布状态：`<draft / authorization-pending / not-authorized / published + URL / existing + URL>`
- 方案与实施决定：`<pending / approved / declined；用户决定及时间>`
- 直接开始指令：`<none 或用户明确要求立即开始修复的原话摘要>`
- 决策：`<keep / merge / split / defer / duplicate / decline>`
- 决策理由：`<由维护者确认的理由>`
- Issue 映射：`<未发布 / #number + URL>`
- 实施与验证：`<commit、改动摘要、命令及 pass/fail/not-run 证据；未开始时填 pending>`
- owner/优先级/日期：`<confirmed value 或 unassigned / unranked / unscheduled>`

## 批次记录

| 日期 | 处理的 Candidate IDs | 合并/拆分/延后/拒绝 | 用户选择 | 发布核对 |
| --- | --- | --- | --- | --- |
| `<日期>` | `R-01` | `<处理与理由>` | `<confirmed / pending>` | `<实际 Issue URL 或 not-published>` |
