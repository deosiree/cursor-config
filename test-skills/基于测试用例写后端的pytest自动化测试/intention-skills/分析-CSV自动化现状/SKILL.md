---
name: 分析-CSV自动化现状
description: RED 阶段：读 CSV、registry、marker 扫描，输出覆盖缺口与推荐 intention。
---

# 策略：分析 CSV 自动化现状

## 何时触发

- 用户给出 `caseIds` 范围但未说明新建还是追加
- 批量任务（>10 条）开始前
- `csv_coverage.py` 报告与预期不符

## 执行步骤

1. 确认 `csvPath` 存在，解析 `caseIds` 列表
2. 从 CSV 读取目标行的：名称、模块名、功能集合、测试步骤
3. 读 `cases_registry.yaml` 中已有条目
4. 扫描 `hytests/test_*.py` 中 `@pytest.mark.csv_case`
5. 对比输出矩阵：

| case_id | CSV | registry | marker | 推荐动作 |
|---------|-----|----------|--------|----------|

6. 根据缺口推荐 **Single Dispatch** intention：
   - 全无 hytests → `策略-从CSV写MVP用例`
   - 部分有 → `策略-批量补自动化`
   - 仅 README 过时 → `策略-仅生成README`

## 输出

```text
coverageGapReport:
  totalRequested: N
  implemented: N
  pending: [...]
  blocked: [...]
  duplicateMarkers: [...]
recommendedIntention: ...
```

## 使用示例

```text
分析 CSV 155-214 菜单管理用例在 hytests 的覆盖缺口，给出下一批 MVP 建议。
```
