---
name: 撰写-用例README
description: 按模板为每个 case_id 生成 hytests/docs/automation/{id}.md，链 workflow 不重复全文。
---

# Feature：撰写用例 README

## 何时触发

- 每个新 `case_id` 需独立自测说明

## 规范

- 模板：[[../../references/用例README模板.md]]
- 样例：[[../../assets/few-shot-example/3545-3570-3571-mvp/after/automation-3545.md]]

## 步骤

1. 从分析表取 `case_id`、`name`、`route`、`steps`、`expected`
2. 写环境节：链 `../workflow.md`，不写完整注入脚本
3. `perm_status: pending_human` 时浏览器步骤标 blocked
4. 含 curl 快验（端点来自 `mock_endpoint`）
5. 控制在 25–40 行

## 输出

`{hytestsDir}/docs/automation/{case_id}.md`

## 使用示例

```text
为 3570 写 automation/3570.md，预期弹窗不关闭、toast 含角色名称已存在。
```
