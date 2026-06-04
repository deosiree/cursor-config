# 契约解析规则（本地引用）

> 完整规则见父级 `[[../../../references/api-contract-resolution.md]]`。
> 本文件是本地薄包装。

## 优先级

1. 默认 `api契约`（seccenter.swagger.json）
2. `补充契约路径`（devmgr / dbres 等）
3. 停止并标记"待人工确认"

## 字段规则

- `apiMethod`：swagger path 方法名，统一大写
- `apiUrl`：swagger path key 原值
- `description`：优先 swagger `description`，缺失回退 `summary`

## 禁止

- 不允许在契约缺失时主观推断 description
- 不允许用未解析变量、gateway 方法名或错误中间路径替代最终 API URL
