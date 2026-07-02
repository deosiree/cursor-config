---
name: 质量-覆盖率自检
description: CSV ↔ registry ↔ marker ↔ README ↔ case_report 五重门禁。
---

# Feature：质量-覆盖率自检

## 触发

每次 pytest / registry / README / case_report 产出或修改后 **强制**执行。

## G1 CSV 映射

- [ ] 每个目标 `case_id` 有 `@pytest.mark.csv_case`
- [ ] 每个 marker 有 registry 条目（pending 除外）
- [ ] 无 duplicate case_id 跨文件

```bash
cd hytests && python scripts/csv_coverage.py
```

## G2 pytest 可运行

- [ ] registry `pytest` node 可收集：`pytest {node} --collect-only`
- [ ] 语法无错误
- [ ] blocked 用例 skip 原因明确

## G3 README 格式

- [ ] 无 `<details>` / `<summary>`
- [ ] 无步骤整块 ` ```text `
- [ ] H4–H6 层级完整
- [ ] JSON/bash 代码块顶格
- [ ] automation_doc 嵌入节无 HTML 包裹 Mermaid

```bash
rg "<details|</details>|<summary" hytests/README.md
# 应无匹配（通用说明里「禁止 details」提及除外）
```

## G4 实现位置

- [ ] implemented 用例含「###### 实现位置」表
- [ ] 含相对路径、`#L` 链接、pytest node
- [ ] refs 用例含「###### 官方参考」表（若有 refs）

## G5 边界

- [ ] 未把 CSV 用例只写进 `tests/` 而无 hytests marker
- [ ] hytests 未误用官方 `test_NN_*` 编号规范替代 csv_case

## G6 可观测性（implemented 强制）

适用于 `cases_registry.yaml` 中 `status: implemented` 且存在 marker 的用例。

- [ ] 测试函数参数含 `case_report`
- [ ] 有 `case_report.begin(...)`
- [ ] `case_report.step` 数量与 CSV「测试步骤」序号行一致（或 ≥1 且覆盖全部手工步骤意图）
- [ ] 每条 CSV「预期结果」至少有 1 条对应 `case_report.check`
- [ ] 函数 docstring 含 **Arrange / Act / Assert** 三段
- [ ] 跑测后 `hytests/.test-reports/latest.log` 存在且含 `[CSV 用例 {id}]`
- [ ] （推荐）registry 含 `automation_doc` 或存在 `docs/automation/{id}.md`（步骤≥3 或含导出预览的用例 **建议必填**）

快速扫描：

```bash
# implemented 但函数签名无 case_report（需人工核对 registry status）
rg "def test_csv_" hytests/test_*.py -A1 | rg -v case_report
```

```bash
pytest {node} -v && type hytests\.test-reports\latest.log
```

## 输出

```text
qualityReport:
  passed: bool
  violations: [{ rule, case_id?, file?, fix }]
  coverageSummary:
    csvTotal: 450
    marked: 35
    registryImplemented: 35
  observability:
    g6Passed: bool
    missingCaseReport: ["9910", ...]
    missingAutomationDoc: ["9912", ...]
```

## 失败处理

| violations | 动作 |
|------------|------|
| 缺 marker | → 撰写-csv_case标记测试 |
| 缺 registry | → 撰写-cases_registry条目 |
| README 格式 | → 生成-README手册 + 修 gen_readme |
| node 错误 | 修 registry pytest 字段 |
| G6 缺 case_report | → 接入-用例验证摘要与中文终端 |
| G6 无 latest.log | 检查基建与 `-s`；跑测后再验 |
| DB=[] 断言失败 | → [[../../references/hytests-api-pitfalls.md]] |

## 使用示例

```text
9909-9913 MVP 完成后跑覆盖率 + G6 自检，列出缺 case_report 的 implemented 用例。
```
