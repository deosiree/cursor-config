# api-types-global

## 目标
基于本轮 `microfb` 与 `apex_dev` 的改造经验，统一 Nebula 前端 API 类型分层：
1. **稳定版本优先**：业务层不再感知 v1/v2 兼容分支，只使用稳定网关方法。
2. **类型职责分离**：`types/` 维护稳定领域类型；`api/` 仅定义后端原始响应类型。
3. **映射单写点**：`gateway` 负责将原始响应映射为稳定领域类型，并向业务层暴露稳定契约。

## MVP 方案（必须先落地）
1. `src/types/**`：新增/维护稳定类型（例如 `UserInfo`、`UserPageVO`）。
2. `src/api/**`：仅保留原始 DTO（例如 `GetUserResponse`），不承载业务稳定类型。
3. `src/api/gateway/**` 或 `src/gateways/**`：
   - 聚合 API 调用；
   - 维护 `mapXxxToStableXxx` 映射函数；
   - 导出稳定返回类型给业务层使用。
4. `views/store/utils/directive/plugins`：
   - 只 import gateway；
   - 只依赖 `types/` 中稳定类型；
   - 删除版本判断与原始 DTO 泄漏。

## 可选增强方案（MVP 完成后）
1. **映射器集中化**：按模块建立 `*.mapper.ts`，避免 gateway 文件膨胀。
2. **契约测试**：为 gateway 增加“原始响应 -> 稳定类型”边界测试。
3. **迁移闸门**：CI 增加扫描，阻止业务层直连 `*.v2.api`。
4. **字段演进策略**：稳定类型新增字段走“可选 -> 必填”两阶段，降低回归风险。

## 分层职责（强约束）
- `types/`：稳定领域模型（面向业务可读性和长期兼容）。
- `api/`：HTTP 协议模型与接口路径（面向后端契约）。
- `gateway/`：防腐层（参数转换、响应映射、错误归一、版本细节收口）。
- 业务层：页面/状态/指令，只消费 gateway 和稳定类型。

## 从当前改动抽象出的规范
1. **User 模块先行**：两端已出现 `types/user` + `user.gateway` 的稳定化路径，可作为模板复制到 role/menu/tenant 等模块。
2. **网关导出稳定类型**：允许 gateway 重导出 `types`，但稳定类型定义源必须在 `types/`。
3. **禁止类型反向污染**：`types/` 不得 import `api/**` 原始 DTO。
4. **业务零感知版本**：业务代码禁止 `if (useV2)` 与直接 import `*.v2.api`。

## 迁移验收清单
1. 业务层检索无直连 API：
   - `rg --line-number "\.v2\.api|\.v1\.api|\.v3\.api" src/views src/store src/utils src/directive src/plugins`
2. 稳定类型在 `types/`：
   - `rg --line-number "export interface .*" src/types`
3. 网关存在映射函数：
   - `rg --line-number "map.*To.*|normalize.*" src/api/gateway src/gateways`
4. 类型检查通过：
   - `pnpm -C microfb type-check`
   - `pnpm -C apex_dev type-check`

## 推荐落地顺序
1. 用户域（已打样） -> 2. 角色域 -> 3. 菜单域 -> 4. 租户域 -> 5. 其余系统配置域。
