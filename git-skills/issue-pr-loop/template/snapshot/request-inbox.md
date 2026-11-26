# 贯通示例：错误通知反馈

此示例展示一条旧项目建议如何在实施前进入候选池。它不是已确认的产品规范；代码事实来自本次只读检查，不能推导出未确认的交互参数。

## 仓库与核对范围

- 仓库：`deosiree/translationtool`
- 模式：旧项目维护
- 工作树：检查时 `develop` 干净
- Issue 检查：创建前公开仓库 Issue 列表为空；本次按用户授权创建了 [Issue #1](https://github.com/deosiree/translationtool/issues/1)。Issue 所依据分支及 PR 目标分支均明确为 `develop`，GitHub 默认分支 `docker` 不作为本 Issue 的基线或目标；基线 commit 为 `d5e2e821aec181d6ff0732aa177245df0208f5f5`。内网 `upstream` 的 tracker 未核验
- 需求/契约：未找到规定错误通知位置、自动关闭时长或历史留存期的已接受规范

## 候选索引

| Candidate ID | 来源/收到时间 | 摘要 | 分类 | 重复状态 | Readiness | 决定/Issue |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | 同事反馈 / 2026-11-25 | 统一错误通知并回看近期通知 | `feature` + `needs-verification` | 创建前公开 Issue 列表为空；内网 tracker `unknown` | `ready` | `#1 已发布并完成决策` |

## R-01：统一错误通知并可回看近期通知

- 当前观察：`src/http/request.js` 的 JSON 响应拦截器通过 `message.error(response.data.message || '操作失败!')` 提示业务错误；错误码用于成功/过期分支判断，但错误提示未附码。`src/utils/notificationUtils.js` 的错误通知默认 `duration = 0`，任务失败通知也设置为 0；多个业务调用点显式设置 0。
- 需求/契约证据：未找到要求通知常驻或特定自动关闭时长的已接受规范，因此不能把既有 `duration: 0` 直接判作回归 bug。
- 参考实现：Apex 的 `src/utils/notification.ts` 使用右下角、3000ms 和 `[code]` 展示。它只是参考，不自动成为 translationtool 的产品决定。
- 分类与理由：整体是体验/能力改进；常驻行为有代码证据，但违反既有要求尚未证实。
- 候选范围：Issue #1 包含统一全局错误通知、错误码前缀、自动关闭、前端近期通知抽屉，以及字段校验失败只显示单元格红字的修正；不新增后端通知历史功能。
- 已确认决策：默认 3000ms 自动关闭；按原样显示 `response.data.code`（包括通用码 `201`），不改后端协议；批量/高频通知只依赖定时关闭，不合并、不设数量上限；抽屉仅在前端保留最近 3 天、最多 100 条，满额淘汰最旧记录；字段校验错误不弹 notification。
- 待澄清：无。若实现中发现现有项目约定与上述边界冲突，先回到 Issue 澄清，不自行改变验收。
- Readiness：R-01a 已具备实现条件；原条件候选 R-01b 已并入 Issue #1，不再单独保留。
- owner/优先级/日期：`unassigned / unranked / unscheduled`

## 批次决定

用户选择先发布 R-01a，创建 [Issue #1](https://github.com/deosiree/translationtool/issues/1)，随后补齐了通知时长、错误码显示、批量行为、历史抽屉范围及字段校验归属。Issue 所依据分支和预期 PR 目标分支均为 `develop`，不采用 GitHub 默认分支 `docker`。用户此前授权实现并创建 PR，但本轮经范围纠正后只优化 `issue-pr-loop` skill，未开展 TranslationTool 产品代码实现、验证或 PR；该授权未被撤销。未授权合并。
