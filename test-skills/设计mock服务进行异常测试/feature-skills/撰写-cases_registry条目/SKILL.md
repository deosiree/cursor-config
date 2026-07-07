---
name: 撰写-cases_registry条目
description: 按 schema 为每个 case_id 追加 cases_registry.yaml 条目。
---

# Feature：撰写 cases_registry 条目

## 何时触发

- 新用例需机器可读索引

## 规范

[[../../references/cases-registry-schema.md]]

## 必填字段

`case_id`、`name`、`status`、`test_mode`、`base_url`、`route`、`scenario_active`、`mock_endpoint`、`mock_readme`、`workflow_doc`、`automation_doc`

## 步骤

1. 读现有 `cases_registry.yaml`，避免重复 `case_id`
2. 按 profile 填 `base_url`、`test_mode`
3. `mock_readme` → `mock/README.md`
4. `workflow_doc` → `docs/workflow.md`
5. `perm_status` / `required_perms` 按分析表填写

## 输出

registry 增量 YAML 块

## 使用示例

```text
追加 3545/3570/3571 三条 registry，status=manual。
```
