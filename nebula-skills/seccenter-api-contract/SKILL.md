---
name: 读取seccenter的api契约
description: Reads and uses the SecCenter Swagger/OpenAPI contract as the source of truth for any API contract, endpoint design, request/response schema alignment, or integration plan. Use when the user mentions API 契约, 接口设计, Swagger/OpenAPI, 协议/字段对齐, 方案设计, ready 接口, or asks to browse/verify seccenter endpoints.
---

# SecCenter API Contract (Swagger Source of Truth)

## 必做前置

- 任何涉及 **API 契约 / 接口设计 / 方案设计 / 字段对齐 / ready 接口梳理** 的对话与产出，**必须先读取**：
  - `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

## 工作流（按顺序执行）

1. **读取契约**
   - 使用 Read 读取上述 Swagger 文件（必要时分段读取）。
2. **定位目标**
   - 以 `paths` 下的 `method + path` 为主键定位接口。
   - 识别 `operationId`、`summary`、`tags`，并注意是否包含 `[ready]` 等标记。
3. **解析入参/出参**
   - 入参：`parameters`（特别是 `in: body` 的 `$ref`）。
   - 出参：`responses["200"].schema.$ref` 与 `responses["default"].schema.$ref`。
4. **展开定义**
   - 从 `definitions` 递归展开 `$ref`，列出字段、类型、必填（若有）、枚举（若有）。
   - 对关键字段给出“前端/后端/网关”侧的映射建议与边界说明。
5. **输出契约对齐结论**
   - 产出“接口清单 + 契约摘要 + 变更影响 + 验收点”，并以 Swagger 片段为证据来源（引用 `operationId` / `path` / `$ref` 名称即可）。

## 标准输出模板（用于方案设计/评审）

```markdown
## 契约来源
- 文件: F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json

## 目标接口
- method/path:
- operationId:
- summary/tags:
- ready 标记:

## 请求（Request）
- content-type:
- body $ref:
- 字段摘要:

## 响应（Response）
- 200 $ref:
- default $ref:
- 字段摘要:

## 兼容性与影响评估
- 破坏性变更:
- 前端改造点:
- 网关/鉴权/会话相关点:

## 验收清单
- 契约字段对齐:
- 错误码/默认错误结构:
- ready 接口可用性:
```

