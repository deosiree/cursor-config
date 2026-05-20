# 契约读取检查清单（新增接口类）

纯**新增** swagger 接口时，在输出 GREEN 前按序完成；编排既有接口可跳过本清单。

## 步骤

| 步 | 动作 | 产出 |
|----|------|------|
| 1 | 确认 `spec_path`（默认 `docs/api/seccenter.swagger.json`，可覆盖） | 实际使用的契约路径 |
| 2 | 在契约中定位 **path + method**，记录 `operationId` / `summary` | 接口落点 |
| 3 | 打开请求/响应 **schema 名**，与将写入 `src/api/**` 的类型名**逐字一致** | 原始类型名列表 |
| 4 | 标出 stable 字段来源：契约字段 / 页面上下文 / 枚举上提 | 字段来源表 |
| 5 | 若契约**无**对应接口，再建议新增 `api` 方法；若有则优先复用 | 是否新增 api |

## 常见错误

- 稳定类型名与 swagger schema 不一致（调试困难）
- 未读契约就假设字段名（与后端漂移）
- 编排类需求误走本清单并重复设计新 api

## 关联

- 分层总则：`[[api-gateway-layering-core.md]]`
- 编排类（常不新增 api）：`[[gateway-orchestration.md]]`
