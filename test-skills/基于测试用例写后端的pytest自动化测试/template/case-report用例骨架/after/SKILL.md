# Template AFTER：单用例 case_report 骨架

复制到任意 `test_csv_*.py` 的 implemented 方法中，替换 `{id}`、`{title}`、步骤与断言。

```python
@pytest.mark.csv_case("{id}")
def test_csv_{id}_example(self, session, case_report, ...):
    """CSV {id}：{一句话简述}。

    Arrange:
        {前置与造数}
    Act:
        {POST 路径与关键参数}
    Assert:
        {与 CSV 预期对齐的列表}
    """
    case_report.begin("{title}")

    # --- Arrange ---
    case_report.step(1, "{CSV 步骤 1 摘要}", f"{运行时 detail}")

    # --- Act ---
    resp = session.post(...)
    case_report.step(2, "POST /seccenter/v2/{path}", f"status={resp.status_code}")

    # --- Assert ---
    ok = ...
    case_report.check("{CSV 预期 1}", ok, f"{实测 detail}")
    assert ok

    # 可选：导出/响应预览
    # case_report.attach_yaml("响应 YAML", text)
    # case_report.attach_text("结构化摘要", text)
```

跑测后打开：`hytests/.test-reports/latest.log`

复杂用例另建：`docs/automation/{id}.md` + registry `automation_doc`。

见 [[../../references/case-report-terminal-spec.md]]、[[../../feature-skills/接入-用例验证摘要与中文终端/SKILL.md]]。
