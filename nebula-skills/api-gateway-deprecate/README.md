# api-gateway-deprecate

## 定位
`api-gateway-deprecate` 用于“旧兼容层退化”场景。

它服务的是这类需求：
- 旧版本接口已经下线
- 仓库里还残留旧 gateway 兼容壳、旧 API、旧测试、旧 mock、临时兜底
- 需要结合契约确认哪些可删，哪些该重命名，哪些只是命名收口
- 希望按阶段执行并分批提交 commit

## frontmatter 模式
本 skill 采用“本地中文模式”：
- `SKILL.md` 的 `name` 使用中文
- `SKILL.md` 的 `description` 使用中文触发描述

## 与旧 skill 的关系
- 以 `degrade-gateway` 为主要模板升级
- 吸收“契约判边”作为第一等规则
- 不再承接多版本长期并存的设计前提

## 共享契约输入
- 默认 `spec_path`：
  `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path`

## 契约与边界

### 共享契约输入
- `route-api-gateway`、`api-gateway-add`、`api-gateway-deprecate` 三者共享同一 API 契约输入规则。
- 默认 `spec_path`：
  `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path` 覆盖默认值。
- 凡涉及接口、字段、原始类型、旧版本识别、名称对齐、退化边界判断，都必须先读取该契约。
- `api-gateway-deprecate` 也必须读取契约，用于判断：
  - 哪些是旧版本 API
  - 哪些只是命名不一致但仍属现行契约
  - 哪些类型/方法需要重命名而不是删除

### `src/api/**`
- 只承载原始接口与原始类型。
- 类型名必须与 Swagger/OpenAPI 类型定义名一致，便于调试和对照契约。
- 不做业务语义映射，不引入 stable 语义命名。

### `src/types/**`
- 只承载稳定类型。
- 供业务层和其他上层消费。
- 不反向污染 `api` 层命名。

### `src/enums/**`
- 放通用常量定义。
- 适用于网关层要用、业务层也要用，或多个业务层共用的稳定常量。
- 这类内容不放在单个页面/组件内部，避免重复定义与语义漂移。

### `src/api/gateway/**` 或 `src/gateways/**`
- 承担 wire/stable 双向映射与 API 集成编排。
- 方法输入输出遵循稳定语义，屏蔽原始 DTO。
- 映射函数命名统一为：
  - `mapWire2StableXXX`
  - `mapStable2WireXXX`
  - `XXX` 使用契约里的原始类型名
- 允许在 gateway 内沉淀：
  - 参数标准化
  - 多 API 编排
  - 并行查询聚合
  - fail-fast 校验
  - 适配业务层的多个稳定入口

### `src/views|src/store|src/composables|src/utils`
- 只做视图与业务编排。
- 禁止直接消费 `src/api` 和原始类型。
- 禁止在业务层写 DTO 映射逻辑。
- 业务层专用常量，如果只在该组件/页面内部定义与消费，可以留在业务层本身，不必上提到 `enums`。

## 固定输出
1. 兼容层落点清单
2. 删除/保留/重命名决策表
3. 业务调用收口清单
4. 旧 API / 旧测试 / 旧 mock / 临时兜底清理清单
5. 验证命令与结果

## 使用示例
```text
使用 $api-gateway-deprecate 扫描当前模块，
判断其中哪些 gateway 兼容壳、旧 API、旧测试、临时兜底已经具备退化条件，
并输出删除/保留/重命名决策表。
```

```text
使用 $api-gateway-deprecate 结合 Swagger 扫描菜单模块，
判断哪些旧 API 真能删，哪些只是命名不一致需要重命名收口。
```

```text
使用 $api-gateway-deprecate 扫描当前仓库，
如果存在待退化的旧兼容层、旧测试或旧 mock，
输出分阶段退化计划，并支持每一阶段单独提交 commit。
```

## agent 素材入口
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/api-gateway-deprecation-core.md]]`

## 固定执行顺序
1. 盘点兼容层与真实引用
2. 读取契约并判断退化边界
3. 删除版本策略层与兼容壳
4. 收口 gateway 与业务调用
5. 删除未使用旧 API、旧测试、旧 mock、临时兜底
6. 清理注释、命名噪音并验证

## 更新型 skill 说明
这是一个更新型 skill，不是“从 0 创建能力”的新增型 skill。

## 模板与素材
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`
- `[[assets/few-shot-example]]`
- `[[references/api-gateway-deprecation-core.md]]`
