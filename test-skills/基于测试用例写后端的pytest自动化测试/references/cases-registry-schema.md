# cases_registry.yaml 字段契约

## 文件位置

`{hytestsDir}/cases_registry.yaml`

## 顶层结构

```yaml
# CSV 自测用例 → hytests 映射注册表
# status: implemented | partial | blocked | pending | skipped
# 运行覆盖率: python scripts/csv_coverage.py

cases:
  - case_id: "9909"
    ...
```

## 单条字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `case_id` | 是 | 与 CSV「用例ID」一致，字符串 |
| `name` | 推荐 | CSV「名称」，便于人工检索 |
| `module` | 推荐 | CSV「功能集合」或「模块名」 |
| `status` | 是 | 见下表 |
| `pytest` | 条件 | `file.py::Class::func` 或 `file.py::func` |
| `refs` | 否 | 官方 `tests/` 参考 node |
| `note` | 否 | 实现与 CSV 差异说明 |
| `automation_doc` | 推荐 | 相对 `hytests/` 的自动化展开 Markdown；复杂 implemented 用例建议必填 |

## status 枚举

| 值 | 含义 | README 展示 |
|----|------|-------------|
| `implemented` | 可 HTTP 执行并通过 | 已实现 |
| `partial` | 部分步骤覆盖 | 部分实现 |
| `blocked` | gRPC/SDK 等 HTTP 无法测 | 阻塞（需 gRPC 等） |
| `pending` | 尚未写 pytest | 待实现 |
| `skipped` | 明确跳过 | 跳过 |

**推断规则（gen_readme）：**

- 有 `@pytest.mark.csv_case` 且无 registry status → `implemented`
- registry 有 `reason` 或 module=会话 SDK 且无 marker → `blocked`
- 否则 → `pending`

## pytest node 格式

```
test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml
```

模块级函数（无类）：

```
test_csv_session_sdk.py::test_csv_9971_get_user_id_blocked
```

## refs 格式

指向 `{repo}/tests/`：

```
tests/test_04_menu.py::TestProjectMenuImportExport
tests/test_04_menu.py::TestProjectMenuImportExport::test_import_project_invalid_yaml
```

gen_readme 会解析 refs 并输出 **官方参考** 实现位置表格（含 `#L` 行号）。

## 示例：implemented

```yaml
- case_id: "9909"
  name: 导出项目菜单配置为YAML
  module: 菜单管理
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml
  automation_doc: docs/automation/9909.md
  refs: tests/test_04_menu.py::TestProjectMenuImportExport
```

```yaml
- case_id: "9911"
  name: 导入菜单YAML含非法格式报错
  module: 菜单管理
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9911_import_invalid_yaml_returns_error
  refs: tests/test_04_menu.py::TestProjectMenuImportExport::test_import_project_invalid_yaml
```

## 示例：blocked

```yaml
- case_id: "9971"
  name: GetUserID从gRPC metadata获取用户ID
  module: 会话 SDK
  status: blocked
  pytest: test_csv_session_sdk.py::test_csv_9971_get_user_id_blocked
  note: 需 gRPC session SDK 客户端
```

## 示例：partial + note

```yaml
- case_id: "9913"
  name: 导入菜单JSON覆盖已有菜单
  module: 菜单管理
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9913_import_overwrites_existing_menus
  note: CSV 写 JSON，实现为 YAML 全量替换
```

## 维护纪律

- 新增 `@pytest.mark.csv_case` **必须**同步 registry
- **implemented** 用例 **必须**接入 `case_report`（见 [[case-report-terminal-spec.md]]、G6 门禁）
- 改函数名/类名 **必须**更新 `pytest` 字段
- 步骤≥3 或含导出预览的 implemented 用例 **建议**提供 `automation_doc`
- 批量 MVP 完成后跑 `csv_coverage.py` 核对缺口
