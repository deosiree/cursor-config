# Develop Plan：<Local ID> / GitHub #<number>

## 状态与锚点

- 状态：`draft | ready | in_progress | verification_failed | awaiting_review | changes_requested | merged | blocked`
- Goal：[[../../goal.md]]（baseline `<版本>`）
- 图谱：[[../../issue-graph.md]]
- Goal 验收 ID：`G-<...>`
- GitHub Issue URL：`<url>`
- 当前 PR：`<url 或 none>`
- 分支/工作树：`<实际值>`
- 前置依赖：`<Local ID / #number；完成证据>`
- 最后同步时间：`<时间或 not-synced>`

## 背景与问题

<说明当前可观察行为、目标行为和证据来源。>

## 本 Issue 范围

### 包含

- `<可交付职责>`

### 不包含

- `<留给其它 Issue 或明确不做的内容>`

## 输入、输出与环境

- 输入：`<API、数据、用户操作>`
- 输出：`<行为、接口或文件>`
- 环境/前置条件：`<依赖版本、服务、feature flag、测试数据>`
- 错误/边界行为：`<失败时预期>`

## 文件边界与接口

- 允许修改：`<路径 glob>`
- 禁止修改/由其它 Issue 所有：`<路径 glob>`
- 接口、数据模型和并行约束：`<已冻结接口或待前置 Issue>`

## 实施步骤

| Node | 改动 | 验收条件 | 验证方法 | 状态 |
| --- | --- | --- | --- | --- |
| N-01 | `<最小步骤>` | `<可观察结果>` | `<测试/命令>` | `todo` |

完成每个节点后：对照 Goal ID、Issue 范围和本表验收条件；若行为偏离，先暂停并记录偏差，不修改标准让结果看起来通过。

## 测试用例

| Case | 场景 | 前置数据 | 操作 | 预期 | 类型 |
| --- | --- | --- | --- | --- | --- |
| T-01 | `<正常/边界/异常>` | `<fixture>` | `<步骤>` | `<断言>` | `unit/integration/e2e/security/performance/manual` |

## 验收与交付物

- [ ] 每个 N 节点完成并有证据。
- [ ] 所有适用测试实际运行且通过，未运行项列明原因。
- [ ] 改动文件在本 Issue 路径边界内。
- [ ] 受影响用户文档和 API 示例已更新。
- [ ] PR 描述关联 `#<number>`、Goal ID 和真实验证证据。
- [ ] 人工审查完成；合并 SHA：`<待填>`。

## 验证记录

| 时间 | Commit | 命令/场景 | 环境 | 结果 | 证据/失败原因 |
| --- | --- | --- | --- | --- | --- |
| `<时间>` | `<SHA>` | `<命令>` | `<版本/环境>` | `pass/fail/not-run` | `<日志/路径>` |

## 审查反馈与修复

| Review | 反馈 | 修改/理由 | 复验 | 状态 |
| --- | --- | --- | --- | --- |
| `<链接/时间>` | `<原意摘要>` | `<commit/文件>` | `<命令与结果>` | `open/resolved/accepted-risk` |

## 偏差与决策

| ID | 计划/Goal | 实际发现 | 影响 | 决策者与决定 | 后续同步 |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

## 最终交接

- Issue 状态/URL：`<实时状态>`
- PR 状态/URL：`<实时状态>`
- 合并 SHA：`<SHA 或 pending>`
- 完成的 Goal ID：`<列表>`
- 剩余风险/未验证项：`<none/list>`
- 下一个已解锁 Local ID：`<ID 或 none>`
