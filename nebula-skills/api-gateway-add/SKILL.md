---
name: 新增 API 分层接入
description: 为 nebula 前端输出 api/types/gateway/business 四层最小改动方案；并强制两条跨模块 gateway 通则——(1) 仅原子 gateway 使用 handleGatewayError，集成 gateway 不包整段以免多 toast，集成内直接调 API 须下沉为原子；(2) gateway 互引须方法内动态 import。适用新增接口、多 API 编排、导出/删除等任意模块。触发词：api-gateway-add、四层接入、原子 gateway、集成 gateway、handleGatewayError、动态 import、gateway 编排、循环依赖。
---

# 新增 API 分层接入

## 目标

1. **四层接入**：不把原始类型泄漏到业务层（`api` / `types` / `gateway` / `business`）。
2. **两条 gateway 通则**（跨模块，非某一业务专用）：
   - **通则一**：仅**原子** gateway 用 `handleGatewayError`；**集成** gateway 不包整段；集成内调其它 gateway 原子方法不再套一层；集成内若直接调 `api` 须先抽原子 gateway。
   - **通则二**：gateway 之间**禁止顶层静态 import**，改方法内 `await import()`。

细则：`[[references/gateway-atomic-vs-integration.md]]`、`[[references/gateway-dynamic-import.md]]`

## 先判需求类型（再选样本）

| 类型 | 特征 | 必读 | 可选样本 |
|------|------|------|----------|
| **A. 新增/变更契约接口** | 要增 `api` 类型、新 gateway 原子方法 | `contract-read-checklist` | `menu-function-api-add` 示意 |
| **B. 编排既有能力** | 组合多个 gateway/api，常不增契约 | 通则一 + 编排 feature-skill | `tenant-delete-orchestration` 真实源码 |
| **C. 跨 gateway 互引** | 多域 gateway 互相调用 | 通则二 | `tenant-delete-orchestration` |

**租户删除**只是类型 B 的印证样本，不代表本 skill 只服务租户域。

## 共享契约输入

- 默认 `spec_path`：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 类型 A 必须先读契约：`[[references/contract-read-checklist.md]]`

## 核心边界（四层）

- `src/api/**`：仅原始接口与契约同名类型
- `src/types/**`：仅稳定类型
- `src/gateway/**`：`stableReq -> wireReq -> api -> wireRes -> stableRes`；映射 `mapWire2StableXXX` / `mapStable2WireXXX`
- **业务层**：只消费 gateway；遵守通则一、通则二
- `src/enums/**`：跨层共用常量

## 子能力路由（按需读取）

| 场景 | 读取 |
|------|------|
| 判定原子/集成、`handleGatewayError` 落点 | `[[references/gateway-atomic-vs-integration.md]]` → `[[feature-skills/网关原子与集成错误分层/SKILL.md]]` |
| 跨 gateway、环依赖 | `[[references/gateway-dynamic-import.md]]` → `[[feature-skills/跨Gateway动态引用/SKILL.md]]` |
| 新增 swagger 接口 | `[[references/contract-read-checklist.md]]` |
| 多步写操作失败顺序 | `[[references/gateway-orchestration.md]]` |
| 印证样本索引 | `[[template/README.md]]` |
| 错误 helper 协议 | `[[../shownotification/SKILL.md]]` |
| 分层总则 | `[[references/api-gateway-layering-core.md]]` |
| 旧接口下线、删 fallback/旧 API | **停止**：引导 `[[../api-gateway-deprecate/SKILL.md]]`；不展开本 skill 的 GREEN 四层设计 |

## RED

1. 业务是否直连 `api` 或原始类型。
2. 需求属 **A / B / C** 哪类（可多选）。
3. 现有 gateway 方法中，哪些已是原子、哪些将变成集成。
4. 读/写链路是否可只改一条。

## GREEN（六段）

1. 现状链路  
2. 最小改动边界  
3. 四层改动清单（gateway 表须含 **原子/集成** + **handleGatewayError 落点**）  
4. 稳定命名与字段来源  
5. 风险点与不做项（类型 B 含部分成功态）  
6. 可执行 todolist  

默认规则：读链路能不动就不动；不把版本号泄漏到 gateway 方法名；**凡改 gateway 必先套用通则一、通则二**。

执行时可配合：`[[assets/few-shot-example]]`、`[[assets/skill-output-checklist.md]]`、`[[test-prompts.json]]`

## REFACTOR

- 类型不稳的类型新建 stable，不偷用 DTO
- 共用常量上提 `enums`
- gateway 聚合见通则一 feature-skill

## 使用示例

```text
使用 $api-gateway-add：菜单管理要支持勾选多个项目批量导出菜单树（可能新增 api 或集成循环 exportMenuTree），
请按四层 + 原子/集成分层 + 动态 import 给出最小改动设计。
```
