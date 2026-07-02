# Few-shot：seccenter 菜单 9909–9913

真实历史样本：`nebula/seccenter/hytests`（2026-07 对话沉淀，含可观测性规范）。

## BEFORE（错误形态 — 勿复现）

### 问题 1：HTML 包裹导致 Obsidian 不渲染 JSON

（同前）

### 问题 2：pytest 无 case_report

```python
def test_csv_9909_export_project_menus_yaml(self, session, clean_isolated_projects):
    """9909: 导出项目菜单配置为 YAML，含 M1(2 API) + M2。"""
    yaml_data = export_project(session, pid)
    assert "menus:" in yaml_data
```

→ 跑完后只有 `PASSED`，看不到 CSV 步骤对照与 YAML 预览。

### 问题 3：用 menu/tree 对比 DB

```python
tree_db = get_menu_tree(session, pid)  # 内部若调 menu/tree → DB=[]
```

→ `Export tree mismatch DB=[] YAML=[...]`

### 问题 4：clear 用 `import menus: []`

→ 菜单越积越多，顶级菜单数远大于 2。

---

## AFTER（正确形态 · 2026-07）

### pytest（case_report + AAA）

```python
@pytest.mark.csv_case("9909")
def test_csv_9909_export_project_menus_yaml(
    self, session, clean_isolated_projects, case_report,
):
    """CSV 9909：导出项目菜单为 YAML，结构与 DB 菜单树一致。

    Arrange: 隔离项目 P1 造 M1(2 API) + M2
    Act: POST /menu/project/export
    Assert: menus 数组；M1/M2；tree_signature 一致
    """
    case_report.begin("导出项目菜单配置为 YAML")
    pid = ISOLATED_PROJECT_A
    meta = setup_m1_m2_tree(session, pid)
    case_report.step(1, "项目 P1 下有 2 个顶级菜单 M1 和 M2", f"project_id={pid}")

    yaml_data = export_project(session, pid, include_apis=True)
    case_report.step(2, "POST /seccenter/v2/menu/project/export", f"project_id={pid}")

    parsed = parse_yaml(yaml_data)
    case_report.check("JSON/YAML 包含 menus 数组", "menus" in parsed, ...)
    case_report.attach_yaml("导出 YAML 原文", yaml_data)

    tree_db = get_menu_tree(session, pid, include_apis=True)  # menu/list
    assert tree_signature(tree_db) == yaml_tree_signature(parsed)
```

### registry

```yaml
- case_id: "9909"
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml
  automation_doc: docs/automation/9909.md
  refs: tests/test_04_menu.py::TestProjectMenuImportExport
```

### 基建文件

| 文件 | 作用 |
|------|------|
| `helpers/case_report.py` | CaseStepReporter + latest.log |
| `plugins/pytest_zh_terminal.py` | PASSED(通过)、摘要日志列表 |
| `conftest.py` | `case_report` fixture |
| `pytest.ini` | `-s` |
| `docs/automation/9909.md` | README 嵌入 |

### 运行时日志

`hytests/.test-reports/latest.log` 含 `[测试步骤]`、`[预期结果校验]`、`[导出产物预览]`。

### README 自动化节

见 [[README-snippet.md]]（含 automation_doc 嵌入）。

---

## 关键差异表

| 维度 | BEFORE | AFTER |
|------|--------|-------|
| 终端可读性 | 仅 PASSED | 中文摘要 + latest.log 路径 |
| CSV 步骤对照 | 无 | case_report step/check |
| 代码注释 | 无分段 | Arrange/Act/Assert + 行注释 |
| DB 树数据源 | menu/tree（可空） | menu/list |
| 项目清理 | menus:[] import | export + delete |
| README | 仅实现位置 | + automation_doc（Mermaid/断言表） |
| implemented G6 | 未要求 | **强制 case_report** |

## revert 锚点

Darwin 评分 <10 时，按本 few-shot **AFTER** 列重写 pytest + registry + automation_doc + 基建。

## 迁移 backlog

9909 已完整 AFTER；9910–9913 与其余 `test_csv_*.py` 的 implemented 用例待补 case_report（见 [[../../references/case-report-terminal-spec.md]] §存量迁移）。
