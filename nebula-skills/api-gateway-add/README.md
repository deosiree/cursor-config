# api-gateway-add

## 定位

`api-gateway-add` 服务两类需求（可叠加）：

1. **四层接入**：新增或变更契约接口，输出 `api / types / gateway / business` 最小改动。
2. **两条 gateway 通则**（跨模块，非租户等业务专用）：
   - **通则一**：仅原子 gateway 使用 `handleGatewayError`；集成 gateway 不包整段；集成内直接调 `api` 须下沉为原子。
   - **通则二**：gateway 互引禁止顶层静态 import，改方法内 `await import()`。

权威细则：`[[references/gateway-atomic-vs-integration.md]]`、`[[references/gateway-dynamic-import.md]]`

## frontmatter 模式
本 skill 采用“本地中文模式”：
- `SKILL.md` 的 `name` 使用中文
- `SKILL.md` 的 `description` 使用中文触发描述

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

### `src/gateway/**` 或 `src/gateways/**`
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
1. 现状链路
2. 最小改动边界
3. 四层改动清单
4. 命名建议
5. 风险点与不做项
6. 可执行 todolist

## 使用示例
```text
使用 $api-gateway-add 扫描“菜单功能项管理”模块，
基于默认契约判断如果要新增接口接入，当前更适合改哪条业务链路，
并输出 api/types/gateway/business 四层最小改动设计。
```

```text
使用 $api-gateway-add 扫描租户管理页面的现有读写链路，
spec_path=F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json，
判断如果要接入新查询和更新接口，读链路和写链路分别应该怎么改。
```

## 需求类型速查

| 类型 | 示例 |
|------|------|
| A 新增接口 | 菜单功能项写接口 |
| B 编排 | 删除前解绑、多项目循环导出 |
| C 跨 gateway | 环依赖、动态 import |

`tenant-delete-orchestration` 模板仅**印证**通则一+二，不代表 skill 只服务租户域。

子节点：`[[feature-skills]]`；few-shot：`[[assets/few-shot-example/gateway-patterns-green.md]]`（菜单多项目导出）。

## agent 素材入口
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/api-gateway-layering-core.md]]`
- `[[references/gateway-orchestration.md]]`
- `[[feature-skills]]`
- `[[test-prompts.json]]`（Darwin / 受控试跑用例）
- `[[evals/darwin-baseline-report.md]]`（Darwin 复评报告）

## 模板与素材
- `[[template/README.md]]`
- 新增接口示意：`[[template/menu-function-api-add/]]`
- 编排真实样本：`[[template/tenant-delete-orchestration/]]`
- `[[assets/few-shot-example]]`
- `[[references/api-gateway-layering-core.md]]`
