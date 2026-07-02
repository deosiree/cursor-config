---
name: 接入-用例验证摘要与中文终端
description: 为 implemented 用例接入 case_report、中文 pytest 终端、.test-reports 日志与 automation_doc 联动。
---

# Feature：接入用例验证摘要与中文终端

## 触发

- 新建或修改 `status: implemented` 的 `@pytest.mark.csv_case` 测试
- hytests 基建初始化（首批 MVP 或新仓库）
- 用户反馈「只有测试摘要、看不到 YAML / 步骤校验」

## 必读

- [[../../references/case-report-terminal-spec.md]]（规范唯一源）
- [[../../references/hytests-api-pitfalls.md]]（DB 空 / 菜单堆积等）
- 黄金样本：`nebula/seccenter/hytests`

## 执行步骤

### 1. 确认基础设施

对照黄金仓库，缺失则从 `seccenter/hytests` 复制或对齐：

| 文件 | 必须 |
|------|------|
| `helpers/case_report.py` | 是 |
| `conftest.py` 内 `case_report` fixture + `pytest_plugins` | 是 |
| `plugins/pytest_zh_terminal.py` + `plugins/__init__.py` | 是 |
| `pytest.ini` 含 `-s` | 是 |
| `.gitignore` 含 `.test-reports/` | 是 |

### 2. 在用例中接入 case_report

```python
@pytest.mark.csv_case("9909")
def test_csv_9909_...(self, session, clean_isolated_projects, case_report):
    """CSV 9909：...

    Arrange: ...
    Act: POST /menu/project/export
    Assert: menus 数组；M1/M2；结构与 DB 一致
  """
    case_report.begin("导出项目菜单配置为 YAML")

    # --- Arrange ---
    meta = setup_...(session, pid)
    case_report.step(1, "项目 P1 下有 ...", f"project_id={pid}")

    # --- Act ---
    yaml_data = export_project(session, pid)
    case_report.step(2, "POST /seccenter/v2/menu/project/export", f"project_id={pid}")

    # --- Assert ---
    parsed = parse_yaml(yaml_data)
    ok = "menus" in parsed
    case_report.check("JSON/YAML 包含 menus 数组", ok, f"顶级数={len(parsed.get('menus') or [])}")
    assert ok

    case_report.attach_yaml("导出 YAML 原文", yaml_data)
```

**blocked / pending** 用例可跳过 case_report（G6 仅约束 implemented）。

### 3. 跑通并验证日志

```bash
cd {repo}/hytests
pytest {node} -v
```

验收：

- [ ] 终端出现 `[用例验证摘要] CSV {id} 完整日志:` 横幅
- [ ] 测试摘要下有「用例验证摘要日志」列表
- [ ] `hytests/.test-reports/latest.log` 含 `[测试步骤]`、`[预期结果校验]`、`合计: N/N`

### 4. 复杂用例：联动 automation_doc

步骤 ≥3 或含 Mermaid 可说明的造数/时序时：

1. 新建 `docs/automation/{case_id}.md`（H6 子节，见 [[../生成-README手册/SKILL.md]]）
2. `cases_registry.yaml` 增加 `automation_doc: docs/automation/{case_id}.md`
3. `python scripts/gen_readme.py`

## CSV → case_report 速查

| CSV | case_report |
|-----|-------------|
| 步骤 1..N | `step(N, 原文摘要, detail=运行时参数)` |
| 预期每条 | `check(预期简述, bool, detail=实测值)` |
| 导出/响应体 | `attach_yaml` 或 `attach_text` |

## 输出

```text
observabilityReport:
  caseId: "9909"
  caseReportIntegrated: true
  logPath: hytests/.test-reports/latest.log
  automationDoc: docs/automation/9909.md | null
  terminalPlugin: plugins/pytest_zh_terminal.py
```

## 检查清单

- [ ] implemented 测试函数参数含 `case_report`
- [ ] `begin` + 与 CSV 步骤数一致的 `step`
- [ ] 每条 CSV 预期至少 1 条 `check`
- [ ] docstring 含 Arrange / Act / Assert
- [ ] 行注释含 `# --- Arrange/Act/Assert ---`
- [ ] 报告字符无 ▶✓→（见 spec）
- [ ] 跑测后 `latest.log` 可打开

## 使用示例

```text
为 CSV 9910 补 case_report：对照 CSV 三步与预期，跑通后确认 latest.log，并写 docs/automation/9910.md。
```

```text
hytests 新建仓库：从 seccenter 复制 case_report 基建，接入中文终端插件。
```
