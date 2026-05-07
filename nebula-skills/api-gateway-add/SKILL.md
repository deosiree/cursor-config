---
name: 新增 API 分层接入
description: 当需要基于 Swagger/OpenAPI 为现有业务接入新接口，并设计 api、types、gateway、business 四层最小改动方案时使用。
---

# 新增 API 分层接入

## 目标
在不把原始类型泄漏到业务层的前提下，为新增接口输出一份可直接实施的最小改动方案，覆盖：
1. `src/api/**` 原始接口与原始类型
2. `src/types/**` 稳定类型
3. `src/api/gateway/**` 映射与编排
4. `src/views|src/store|src/composables|src/utils` 的稳定消费入口

先看：
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

需要长说明时再看：
- `[[references/api-gateway-layering-core.md]]`

## 共享契约输入
- 默认 `spec_path`：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path`
- 在判断接口、字段、原始类型、命名和修改边界前，必须先读取契约

## 核心边界
- `src/api/**`
  - 只放接口方法和原始类型
  - 原始类型名必须与契约定义名一致
- `src/types/**`
  - 只放稳定类型
- `src/enums/**`
  - 放网关层和多个业务层都会共用的通用常量
- 业务层
  - 只消费 gateway 方法与稳定类型
  - 组件内部专用常量可留在业务层本地
- `src/api/gateway/**`
  - 负责 `stableReq -> wireReq -> api -> wireRes -> stableRes`
  - 映射函数统一命名为 `mapWire2StableXXX` / `mapStable2WireXXX`
  - `XXX` 使用契约里的原始类型名

## RED：先看失败基线
1. 当前业务是否直连 `src/api/**` 或直接使用原始类型。
2. 当前新增需求会影响哪些链路，这些链路的类型是属于读库还是写库。建议用户，尽量一次只改动一条链路，渐进修改。
3. 现有页面是否已经持有可复用的上下文、刷新逻辑、稳定常量。
4. 哪些字段来自契约返回体，哪些字段来自父节点上下文。

若没有先看清现状链路，不要直接给设计。

## GREEN：输出最小改动设计
1. 现状链路
2. 最小改动边界
3. `api/types/gateway/business` 四层改动清单
4. 稳定命名与字段来源
5. 风险点与不做项
6. 可执行 todolist

默认规则：
1. 读链路能不动就不动。
2. 不把后端版本号泄漏到 gateway 稳定方法名。
3. 不把后端持久化主键污染到无关注册信息里。
4. 网关可以封装单 API、多 API 串行、并行聚合，更贴近业务消费。

执行时可配合：
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`

## REFACTOR：补边界与命名
1. 若类型看起来能复用但语义不稳，需要人类介入，优先新建稳定类型而不是偷用原始 DTO。
2. 若常量会被网关层和多个业务点共用，上提到 `src/enums/**`。
3. 若常量只服务单个页面/组件，留在业务层本地。
4. 注意，对于判断为留在业务层本地的常量，检查业务层其他地方是否有能复用或能复用但语义不稳的，需要人类介入：是否应该复用并把对应常量也提升到`src/enums/**`。
5. 若 gateway 需要聚合多 API，明确每一步的输入输出还是稳定语义还是原始语义。

## 使用示例
```text
使用 $api-gateway-add 扫描菜单功能项管理模块，
基于默认契约判断是否需要新增接口，
如果要接入新增接口，当前更适合改哪条链路、应补哪些稳定类型和 gateway 入口。
```
