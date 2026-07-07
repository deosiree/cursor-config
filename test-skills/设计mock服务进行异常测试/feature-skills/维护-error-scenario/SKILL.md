---
name: 维护-error-scenario
description: 管理 .mock-shared/error-scenario.json 的 active 值与用例 ID 对应关系。
---

# Feature：维护 error-scenario

## 何时触发

- 新增用例需新 `scenario_active`
- 文档需说明场景切换

## 文件

`{scenarioFile}` 默认 `.mock-shared/error-scenario.json`：

```json
{ "active": "3545" }
```

## 规则

- `active` 默认等于 `case_id`（字符串）
- 多用例共存于同一 mock 文件，靠 `active` 分支
- 改 `active` 后刷新浏览器，无需重启 dev
- 在 `mock/README.md` 用例表注明各 `active` 值

## 输出

- 更新后的 JSON（若需默认 active 说明）
- `mock/README.md` 场景表增量

## 使用示例

```text
注册 3571 场景 active=3571，更新 mock README 场景表。
```
