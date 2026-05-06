# degrade-gateway

## 定位
`degrade-gateway` 用于把已经失去运行意义的网关兼容层系统性退化掉。

它服务的是这类场景：
- 旧版本接口已经下线，不再允许 `v1 -> v2` 或 `v2 -> v1` fallback。
- 仓库里还留着 `gateway-version-policy`、`gateway-executor`、`executeWithVersionFallback` 一类历史抽象。
- 业务层已经可以只消费现行网关方法，但还残留 `loginV2 -> login` 这种兼容壳。
- 旧 API 文件、旧测试、临时兜底文件还躺在仓库里，继续保留只会误导后续开发。

## frontmatter 模式
本 skill 采用“本地中文模式”：
- `SKILL.md` 的 `name` 使用中文
- `SKILL.md` 的 `description` 使用中文触发描述

原因：
- 该 skill 面向 `nebula` 内部中文仓库长期复用
- 主要服务中文团队维护与二次编辑
- 不追求对外英文 frontmatter 兼容性

## 和相邻 skill 的边界
- `gateway-version-control`
  - 负责“建立版本兼容与统一执行策略”。
  - 本 skill 负责“拆除已经失效的版本兼容与统一执行策略”。
- `api-types-global`
  - 负责“稳定类型 + 原始 DTO + gateway 映射”的分层治理。
  - 本 skill 负责“退化旧版本兼容层、下线旧 API 与旧测试”。

## 适用场景
- `src/api/gateway` 中存在统一版本策略文件或 fallback 执行器。
- 同一 gateway 同时维护新旧 API 调用分支，但旧分支已经不应再被命中。
- 业务层已经不再需要某些旧网关方法或旧 API 文件。
- 测试仍在验证旧 fallback、旧 mock、旧版本策略，而这些行为已经不再真实。

## 不适用场景
- 旧接口尚未正式下线。
- 仍需要灰度、租户差异或运行时双版本切换。
- 当前目标是新增稳定类型映射或建立网关层，那应优先使用 `api-types-global` 或 `gateway-version-control`。

## 输入
- 目标仓库源码。
- 现有 gateway、旧 API、业务调用链、测试文件。
- 明确的前提：旧版本接口已下线，不能再 fallback。

## 输出
- 兼容层落点清单。
- 删除/保留决策表。
- 业务调用收口清单。
- 旧 API / 旧测试 / 临时兜底文件清理清单。
- 验证命令与通过标准。

## 更新型 skill 说明
这是一个更新型 skill，不是“从 0 创建能力”的新增型 skill。

优先看：
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

`before/after` 直接来源于本次真实会话中的 `microfb` 网关退化前后状态，用来展示：
- 版本策略层如何退化
- `loginV2 -> login` 如何收口
- 无引用旧 API 如何删除
- `temp-v1-menu.ts` 如何退场
- fallback 测试如何清理

## 固定执行顺序
1. 盘点兼容层与真实引用。
2. 删除版本策略层与执行器。
3. 收口 gateway 与业务调用。
4. 删除未使用旧 API、旧测试、临时兜底。
5. 清理导出、注释和历史命名噪音。
6. 跑残留检索、测试、类型检查。

## 目录分层说明
- `[[template/]]`
  - 给人看
  - 放更新型示例、修改前后对照、片段化前后状态
- `[[assets/]]`
  - 给 agent 用
  - 放 frontmatter 模板、few-shot、输出检查清单
- `[[references/]]`
  - 放长说明、边界、设计理由
- `[[evals/]]`
  - 放 should-trigger / should-not-trigger 用例

## 使用示例
```text
使用 $degrade-gateway 退化 microfb 中已经失效的网关版本兼容层：
1. 删除 gateway-version-policy / gateway-executor
2. 把业务层 loginV2 收口到 login
3. 顺手删除无引用的旧 auth.api.ts、role.api.ts 和失效测试
```

```text
使用 $degrade-gateway 检查当前仓库里哪些 gateway fallback 已经是死代码，
给出“可删兼容层 + 必须保留入口 + 需同步清理的测试”清单
```

## agent 素材入口
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/gateway-degradation-core.md]]`

## 验收
- 残留检索无命中：
  - `gateway-executor`
  - `gateway-version-policy`
  - `executeWithVersionFallback`
  - 约定已删除的旧方法名与临时兜底名
- 相关测试通过
- `type-check` 通过
- 业务层调用链只保留现行网关入口
