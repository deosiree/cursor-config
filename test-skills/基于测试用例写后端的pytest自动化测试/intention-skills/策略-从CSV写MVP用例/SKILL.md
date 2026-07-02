---
name: 策略-从CSV写MVP用例
description: 首批 CSV ID 批次：新建 test_mvp_*.py + registry + gen_readme，参照 9909-9913 黄金样本。
---

# 策略：从 CSV 写 MVP 用例

## 何时触发

- `hytests/` 不存在或目标 `caseIds` 尚无 marker
- 用户指定 MVP 范围（如 9909–9913）
- `deliverables` 含 `pytest` 或 `all`

## 执行步骤

1. 读 CSV 目标行，按功能集合分组
2. 若缺基建：参照 [[../../template/hytests-MVP骨架/after/SKILL.md]] 确认 conftest/config/pytest.ini
3. 新建 `test_mvp_{feature}_{id_range}.py` 或 `test_csv_{module}.py`
4. → [[../../feature-skills/撰写-csv_case标记测试/SKILL.md]] 写 Test 类 + 方法（**含 case_report**）
5. → [[../../feature-skills/接入-用例验证摘要与中文终端/SKILL.md]] 确认基建与 latest.log
6. → [[../../feature-skills/撰写-cases_registry条目/SKILL.md]] 批量写 registry（含 `automation_doc`）
7. 可选：对照 `tests/` 填 `refs`（[[../../写pytest集成测试/SKILL.md]] 找类似场景）
8. → [[../../feature-skills/质量-覆盖率自检/SKILL.md]]（含 G6）
9. → [[../../feature-skills/生成-README手册/SKILL.md]] 重生成 README

## 文件命名

- 菜单 MVP：`test_mvp_menu_9909_9913.py`
- 鉴权模块：`test_csv_auth.py`

## 输出

- 新建/修改的 `test_*.py`
- `cases_registry.yaml` 增量
- `README.md` 重生成确认（条数、样本 case_id 抽查）

## 使用示例

```text
为 CSV 9909-9913 写菜单导入导出 MVP，refs 指向 test_04_menu.py::TestProjectMenuImportExport。
```
