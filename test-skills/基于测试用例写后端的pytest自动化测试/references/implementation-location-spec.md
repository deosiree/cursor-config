# 实现位置表格规范

## 用途

README「##### 自动化测试」下的 **###### 实现位置** 表格，让测试人员在 Obsidian 中一键跳到 pytest 源码行。

由 `seccenter/hytests/scripts/gen_readme.py` 自动生成，字段契约如下。

## hytests 实现（已实现 / blocked 且有 marker）

| 项 | 说明 | 示例 |
|----|------|------|
| 相对路径 | 自 repo 或 hytests 视角 | `` `hytests/test_mvp_menu_9909_9913.py` `` |
| 文件 | 链到 def 行 | [`test_mvp_menu_9909_9913.py:26`](test_mvp_menu_9909_9913.py#L26) |
| 测试类 | 类名 + 类定义行 | TestCsvMenuMvp9909_9913 · [`L22`](test_mvp_menu_9909_9913.py#L22) |
| csv_case 标记 | marker 行 + snippet | [`L25`](...#L25) `` `@pytest.mark.csv_case("9909")` `` |
| 测试函数 | def 行 + 函数名 | [`L26`](...#L26) `` `test_csv_9909_export_project_menus_yaml` `` |
| pytest node | 完整 node id | `` `test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_...` `` |

无测试类时省略「测试类」行（如 `test_csv_session_sdk.py`）。

## 官方参考（registry `refs`）

**###### 官方参考** 小节，同样用表格：

| 项 | 示例 |
|----|------|
| 相对路径 | `` `tests/test_04_menu.py` `` |
| 文件 | [`test_04_menu.py:3181`](../tests/test_04_menu.py#L3181) |
| 测试类 | TestProjectMenuImportExport · [`L2865`](../tests/test_04_menu.py#L2865) |
| 测试函数 | [`L3181`](../tests/test_04_menu.py#L3181) `test_import_project_invalid_yaml` |
| pytest node | `` `test_04_menu.py::TestProjectMenuImportExport::test_import_project_invalid_yaml` `` |

## Obsidian 链接规则

| 场景 | href 格式 |
|------|-----------|
| README 与 test 同目录（hytests） | `test_xxx.py#L25` |
| README 指向 tests | `../tests/test_04_menu.py#L3181` |

## scan_markers 算法摘要

1. 遍历 `hytests/test_*.py`
2. 跟踪当前 `class` 与 `class_line`
3. 见 `@pytest.mark.csv_case("ID")` → 记录 `marker_line`
4. 见 `def test_*` → 绑定 pending marker，记录 `def_line`
5. 输出 `case_id → { file, rel_path, class, class_line, marker_line, def_line, marker_snippet, def_snippet }`

## resolve_pytest_node

解析 registry `pytest` 或 `refs` 字符串 `file.py::Class::func`：

1. 在 `hytests/` 或 `tests/` 查找文件
2. 扫描 `class` / `def` / 上方 marker 行号
3. 生成 `implementation_table()` 行

## 待实现用例

无 marker 时 **不输出** 实现位置表，仅：

```markdown
###### 待办

在 `hytests/` 新增 `@pytest.mark.csv_case("155")` 测试，
并更新 `cases_registry.yaml`。
```

## 验证清单

- [ ] 已实现用例 README 含「实现位置」表
- [ ] `#L` 行号与当前源码一致（改代码后重跑 gen_readme）
- [ ] 无 `<details>` 包裹表格或代码块
- [ ] blocked 用例仍有 marker 行号（即使 pytest.skip）

## 黄金样本

- CSV 9909：`seccenter/hytests/README.md` 搜索 `#### [9909]`
- 样例片段：[[../assets/few-shot-example/seccenter菜单9909-9913/README-snippet.md]]
