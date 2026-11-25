# 贯通示例：错误通知反馈

此示例展示一条旧项目建议如何在实施前进入候选池。它不是已确认的产品规范；代码事实来自本次只读检查，不能推导出未确认的交互参数。

## 仓库与核对范围

- 仓库：`deosiree/translationtool`
- 模式：旧项目维护
- 工作树：检查时 `develop` 干净
- Issue 检查：创建前公开仓库 Issue 列表为空；本次按用户授权创建了 [Issue #1](https://github.com/deosiree/translationtool/issues/1)。`gh issue view` 读回确认标题、正文、`OPEN` 状态、无标签和无分派；内网 `upstream` 的 tracker 未核验
- 需求/契约：未找到规定错误通知位置、自动关闭时长或历史留存期的已接受规范

## 候选索引

| Candidate ID | 来源/收到时间 | 摘要 | 分类 | 重复状态 | Readiness | 决定/Issue |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | 同事反馈 / 2026-11-25 | 统一错误通知并可回看近期通知 | `feature` + `needs-verification` | 创建前公开 Issue 列表为空；内网 tracker `unknown` | `needs-info` | `R-01a → #1 已发布；R-01b 暂缓` |

## R-01：统一错误通知并可回看近期通知

- 当前观察：`src/http/request.js` 的 JSON 响应拦截器通过 `message.error(response.data.message || '操作失败!')` 提示业务错误；错误码用于成功/过期分支判断，但错误提示未附码。`src/utils/notificationUtils.js` 的错误通知默认 `duration = 0`，任务失败通知也设置为 0；多个业务调用点显式设置 0。
- 需求/契约证据：未找到要求通知常驻或特定自动关闭时长的已接受规范，因此不能把既有 `duration: 0` 直接判作回归 bug。
- 参考实现：Apex 的 `src/utils/notification.ts` 使用右下角、3000ms 和 `[code]` 展示。它只是参考，不自动成为 translationtool 的产品决定。
- 分类与理由：整体是体验/能力改进；常驻行为有代码证据，但违反既有要求尚未证实。
- 候选拆分：
  - R-01a：统一请求层和业务错误通知的外观、位置、自动关闭及错误码展示，已形成 Issue #1。状态为 `needs-info`，不代表已批准实现。
  - R-01b：提供全局通知记录抽屉，自动关闭的 toast 仍可在一段时间内回看；保留为条件候选，等确认需求和留存边界后再决定是否发布。
- 待澄清：自动关闭时长和是否按错误级别调整；错误码是仅展示还是驱动文案/分类；历史时间窗、最大条数及是否跨会话保留。
- Readiness：R-01a 为 `needs-info`；Issue #1 已发布用于集中评审。时长、错误码映射、批量消息边界和统一范围确认前不安排实现；R-01b 仍未发布。
- owner/优先级/日期：`unassigned / unranked / unscheduled`

## 批次决定

用户选择先发布 R-01a，创建 [Issue #1](https://github.com/deosiree/translationtool/issues/1)。首次 GitHub API 查询超时；随后 `gh issue view` 读回确认标题、正文、`OPEN` 状态、无标签和无分派。R-01b 仍是条件候选，是否与 #1 构成阻塞依赖要等统一通知事件模型确定。Issue 发布、实现、PR 和合并是后续独立阶段；本次未启动实现或排期。
