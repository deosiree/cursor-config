---
name: 撰写-cases_registry条目
description: 维护 hytests/cases_registry.yaml：status、pytest node、refs、note。
---

# Feature：撰写 cases_registry 条目

## 触发

每新增/重命名 `@pytest.mark.csv_case` 后 **同步**执行。

## 必读

[[../../references/cases-registry-schema.md]]

## 单条模板

```yaml
- case_id: "9909"
  name: 导出项目菜单配置为YAML
  module: 菜单管理
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml
  refs: tests/test_04_menu.py::TestProjectMenuImportExport
```

## status 选择

| 情况 | status |
|------|--------|
| HTTP 可跑且已实现 | `implemented` |
| 只覆盖部分 CSV 步骤 | `partial` |
| gRPC/SDK，pytest.skip | `blocked` |
| 尚未写测试 | 不写条目或 `pending` |

## pytest 字段规则

- 与 pytest 收集 node **完全一致**
- 重命名函数后 **必须**更新
- 格式：`{file}::{Class}::{func}` 或 `{file}::{func}`

## refs 规则

- 指向 `tests/` 中最接近的官方用例
- 尽量精确到 `test_*` 方法
- 仅 hytests 独创场景可省略 refs

## 批量追加纪律

1. 按 module 注释分组（`# --- 鉴权与白名单 ---`）
2. case_id 字符串引号
3. 提交前 `python scripts/csv_coverage.py` 核对

## 输出

- registry YAML 增量 diff 摘要
- 新增条目 case_id 列表

## 使用示例

```text
为 9910-9913 补 registry，status=implemented，9913 note 注明 CSV 写 JSON 实现用 YAML。
```
