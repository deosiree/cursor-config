# Template AFTER：hytests MVP 骨架（目标态）

## 特征

- CSV ID 批次（如 9909–9913）有 pytest + registry + README
- Obsidian 可读 README（无 HTML 包裹）
- 实现位置含行号
- **implemented 用例接入 case_report + latest.log**
- 复杂用例含 `docs/automation/{id}.md`

## 目录快照

```
seccenter/hytests/
├── conftest.py                  # case_report fixture, pytest_plugins
├── config.py
├── pytest.ini                   # addopts = -v --tb=short -s
├── cases_registry.yaml          # automation_doc 字段
├── test_mvp_menu_9909_9913.py
├── README.md                    # gen_readme 生成
├── README.format-demo.md
├── .gitignore                   # .test-reports/
├── .test-reports/               # latest.log（运行时生成）
├── docs/
│   └── automation/
│       └── 9909.md
├── plugins/
│   ├── __init__.py
│   └── pytest_zh_terminal.py
├── scripts/
│   ├── gen_readme.py            # load_automation_doc
│   └── csv_coverage.py
└── helpers/
    ├── case_report.py
    └── menu_helpers.py          # get_menu_tree → menu/list
```

## 最小 registry 片段

```yaml
cases:
  - case_id: "9909"
    name: 导出项目菜单配置为YAML
    module: 菜单管理
    status: implemented
    pytest: test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml
    automation_doc: docs/automation/9909.md
    refs: tests/test_04_menu.py::TestProjectMenuImportExport
```

## 最小 pytest 片段

```python
class TestCsvMenuMvp9909_9913:
    @pytest.mark.csv_case("9909")
    def test_csv_9909_export_project_menus_yaml(
        self, session, clean_isolated_projects, case_report,
    ):
        """CSV 9909：... Arrange / Act / Assert"""
        case_report.begin("...")
        ...
```

## 交付命令

```bash
cd seccenter/hytests
pytest -m csv_case -v -k "9909 or 9910 or 9911 or 9912 or 9913"
python scripts/csv_coverage.py
python scripts/gen_readme.py
type .test-reports\latest.log
```

## 黄金参考

- 完整实现：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\hytests`
- Few-shot：[[../../../assets/few-shot-example/seccenter菜单9909-9913/SKILL.md]]
- 单用例骨架：[[../../case-report用例骨架/after/SKILL.md]]

## 验收

- [ ] implemented case_id 均有 marker + registry
- [ ] **G6：implemented 均有 case_report + latest.log**
- [ ] README [9909] 含实现位置与 automation_doc
- [ ] csv_coverage 无 duplicate / 缺口说明
