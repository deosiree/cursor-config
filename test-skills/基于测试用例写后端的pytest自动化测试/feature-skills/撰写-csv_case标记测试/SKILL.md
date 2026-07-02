---
name: 撰写-csv_case标记测试
description: 在 hytests/test_*.py 写 @pytest.mark.csv_case 对齐的 pytest 方法，含 case_report、AAA 注释与断言。
---

# Feature：撰写 csv_case 标记测试

## 触发

`策略-从CSV写MVP用例` 或 `策略-批量补自动化` 选定目标文件后。

## 必读

- [[../../references/csv-case-marker-conventions.md]]
- [[../../references/case-report-terminal-spec.md]]（implemented 强制 case_report）
- [[../../references/hytests-api-pitfalls.md]]
- [[../../写pytest集成测试/references/seccenter-anatomy.md]]（docstring、断言）
- 黄金样本：`seccenter/hytests/test_mvp_menu_9909_9913.py`

## 最小模板（implemented）

```python
"""CSV 用例 MVP：9909~9913 菜单导入导出。"""
import pytest
from utils import assert_success, assert_error


class TestCsvMenuMvp9909_9913:
    """菜单管理 CSV 自测 MVP（9909~9913）。"""

    @pytest.mark.csv_case("9909")
    def test_csv_9909_export_project_menus_yaml(
        self, session, clean_isolated_projects, case_report,
    ):
        """CSV 9909：导出项目菜单为 YAML，结构与 DB 菜单树一致。

        Arrange:
            在隔离项目 P1 造 M1（含 2 API）+ M2。
        Act:
            POST /menu/project/export，include_apis=True。
        Assert:
            YAML 含 menus；M1/M2 存在；结构与 DB 一致。
        """
        case_report.begin("导出项目菜单配置为 YAML")

        # --- Arrange：隔离项目 + 标准夹具 ---
        pid = ISOLATED_PROJECT_A
        meta = setup_m1_m2_tree(session, pid)
        case_report.step(1, "项目 P1 下有 2 个顶级菜单 M1 和 M2", f"project_id={pid}")

        # --- Act：导出 YAML ---
        yaml_data = export_project(session, pid, include_apis=True)
        case_report.step(2, "POST /seccenter/v2/menu/project/export", f"project_id={pid}")

        # --- Assert：menus 数组 ---
        parsed = parse_yaml(yaml_data)
        has_menus = "menus" in parsed
        case_report.check("JSON/YAML 包含 menus 数组", has_menus, f"顶级数={len(parsed.get('menus') or [])}")
        assert has_menus

        case_report.attach_yaml("导出 YAML 原文", yaml_data)
```

写完后 → [[../接入-用例验证摘要与中文终端/SKILL.md]] 验收 `latest.log`。

## blocked 模板

```python
@pytest.mark.csv_case("9971")
@pytest.mark.blocked
def test_csv_9971_get_user_id_blocked():
    pytest.skip("CSV 9971: requires gRPC session SDK client")
```

blocked 用例 **不要求** case_report。

## 检查清单

- [ ] `@pytest.mark.csv_case("{CSV用例ID}")` 与函数名 id 一致
- [ ] 文件/类/方法中文 docstring
- [ ] **implemented：函数参数含 `case_report`**
- [ ] **implemented：docstring 含 Arrange / Act / Assert**
- [ ] **implemented：有 `case_report.begin` + 与 CSV 步骤数一致的 `step`**
- [ ] **implemented：每条 CSV 预期至少 1 条 `case_report.check`**
- [ ] **implemented：关键段有 `# --- Arrange/Act/Assert ---` 行注释**
- [ ] 使用 `session` 等 fixture，非硬编码 Cookie
- [ ] `assert_success` / `assert_error`，非裸 status_code
- [ ] 测试数据唯一（`generate_unique_name` / 隔离项目 fixture）
- [ ] 无 `unittest.mock` 业务 HTTP
- [ ] 隔离项目树断言用 `menu/list`，勿用 `menu/tree`（见 pitfalls）

## 从 CSV 步骤到代码

| CSV 步骤 | 代码 |
|----------|------|
| POST /menu/create + JSON | helper `create_menu(session, ...)` 或 session.post |
| 前置：已登录 | 依赖 `session` fixture |
| 前置：已存在菜单 A | setup helper 或 fixture 创建 |
| 预期：返回错误 | `assert_error(resp, msg="...")` |
| 步骤 1..N | `case_report.step(N, ...)` |
| 预期每条 | `case_report.check(...)` 后 `assert` |

## 输出

- 新增/修改的 test 方法与 marker 列表
- case_report 接入确认（implemented）
- 建议 pytest 运行命令 + `latest.log` 路径

## 使用示例

```text
为 case_id 9911 在 TestCsvMenuMvp9909_9913 追加 test_csv_9911_import_invalid_yaml_returns_error，必须 case_report + AAA。
```
