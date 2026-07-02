# README 片段：[9909] 导出项目菜单配置为 YAML

摘自 `seccenter/hytests/README.md`（gen_readme 生成，Obsidian 兼容）。  
含 **automation_doc** 嵌入与 **case_report** 日志说明。

---

#### [9909] 导出项目菜单配置为YAML

##### 元信息

| 字段 | 值 |
|------|-----|
| 等级 | P0 |
| 涉及 API | `/seccenter/v2/menu/export` |

##### 测试步骤与预期

###### 操作步骤

1. 项目 P1 下有 2 个顶级菜单 M1（含 2 个 API）和 M2
2. 调用 `/seccenter/v2/menu/project/export`（project_id=P1.id）
3. 检查返回的 YAML

###### 预期结果

- JSON 包含 menus 数组
- 结构与导出前菜单树一致

##### 自动化测试

###### 状态

已实现

###### 实现位置

| 项 | 值 |
|----|-----|
| 相对路径 | `hytests/test_mvp_menu_9909_9913.py` |
| csv_case 标记 | `@pytest.mark.csv_case("9909")` |
| 测试函数 | `test_csv_9909_export_project_menus_yaml` |
| pytest node | `test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml` |

###### 运行命令

```bash
cd seccenter/hytests
pytest test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml -v
pytest -k 9909 -v
```

###### 测试数据（Arrange）

（`docs/automation/9909.md` 嵌入：Mermaid flowchart + 造数表）

###### 执行流程（Act）

（Mermaid sequenceDiagram：export → parse → menu/list 对比）

###### 断言清单（Assert）

| 序号 | 代码意图 | 对应 CSV 预期 |
|------|----------|---------------|
| 1 | YAML 非空且含 menus | 返回有效 YAML |
| 2 | 顶级菜单 == 2 | M1 + M2 |
| 5 | tree_signature 一致 | 结构与导出前一致 |

###### 终端验证摘要（case_report）

| 方式 | 位置 |
|------|------|
| **推荐** | `hytests/.test-reports/latest.log` |
| 按用例 | `hytests/.test-reports/9909_*.log` |

> Cursor 对 PASSED 用例默认不展开 stdout；请打开 log 文件查看 YAML 全文。

###### 官方参考

| 项 | 值 |
|----|-----|
| pytest node | `test_04_menu.py::TestProjectMenuImportExport` |

##### 手动测试

###### curl 验证

```bash
export BASE="http://YOUR_GATEWAY:8000"
curl -b cookies.txt -X POST "$BASE/seccenter/v2/menu/project/export" ...
```

---

完整 automation_doc 原文见：`seccenter/hytests/docs/automation/9909.md`
