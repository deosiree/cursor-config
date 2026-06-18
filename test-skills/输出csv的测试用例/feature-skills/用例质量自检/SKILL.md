---
name: 用例质量自检
description: 对已生成的 cases.json 执行质量清单检查，输出问题行报告。
---

# 用例质量自检

## Task

读取 `cases.json`，对照 `case-quality-checklist.md` 逐条检查，输出检查报告。

## Input

- `cases_path`：要检查的 `*.cases.json` 路径
- `path_type`：`"api"`、`"ui"`（v1）或 `"ui-v2"`（功能集合重组）

## Output

质量检查报告，格式：

```text
=== 质量检查报告 ===
总用例数：N
通过：N
警告：N
不通过：N

问题行：
- case #3「名称」：步骤 > 7 步（警告）
- case #5「名称」：预期含代码断言（不通过）
```

## Boundary

- **只读不写**：不修改 cases.json
- **不阻断流程**：报告问题后由上游 intention 决定是否修正
- **不检查脚本调用**：只检查用例内容

## 检查项

严格按 `[[../../references/case-quality-checklist.md]]` 执行：

| # | 检查项 | API | UI |
|---|--------|-----|----|
| A | 单验证点 | ✅ | ✅ |
| B | 可检索名称 | ✅ | ✅ |
| C | 步骤 ≤ 7 | ✅ | ✅ |
| D | 动词开头 | ✅ | ✅ |
| E | 前置条件不混入步骤 | ✅ | ✅ |
| F | 无代码断言 | ✅ | ✅ |
| G | develop结果=预期结果 | — | ✅ |
| H1 | 功能集合留空 | — | ui |
| H2 | 功能集合必填 | — | ui-v2 |
| I | 用例ID留空 | — | ui / ui-v2 |
| J | 正向：格式 | ✅ | — |
| K2 | mock 例外（异常处理） | — | ui-v2 |
| L | cases.json expected 必填 | — | ui-v2 |
| M | CSV 格式合规 | — | ui-v2（生成 CSV 后） |
| L2 | 用例类型与 direction | — | ui-v2 |

## Example

```text
输入：configs/role-ui-tab.cases.json, path_type=ui
输出：3 条用例全部通过，0 警告，0 不通过
```
