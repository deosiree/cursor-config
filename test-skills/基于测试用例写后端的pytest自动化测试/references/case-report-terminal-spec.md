# case_report 与中文终端规范

> 适用于所有 `status: implemented` 的 hytests 用例。黄金实现：`nebula/seccenter/hytests`。

## 目标

让每条 CSV 自动化用例在跑完后能回答三件事：

1. CSV 手工步骤是否逐步执行？
2. 每条预期是否逐项校验？
3. 完整验证日志（含 YAML/响应预览）在哪里看？

## 基础设施清单（MVP 仓库必须具备）

| 文件 | 职责 |
|------|------|
| `helpers/case_report.py` | `CaseStepReporter`、`save_case_report_log`、会话日志路径收集 |
| `conftest.py` | `case_report` fixture；`pytest_plugins = ["plugins.pytest_zh_terminal"]` |
| `plugins/pytest_zh_terminal.py` | `PASSED(通过)` / `FAILED(失败)`、测试摘要、用例验证摘要日志汇总 |
| `pytest.ini` | `addopts = -v --tb=short -s` |
| `.gitignore` | `.test-reports/` |

`conftest.py` 顶部建议：`os.environ.setdefault("PYTHONUTF8", "1")`。

## 测试内用法契约（implemented 强制）

### 1. 注入 fixture

```python
def test_csv_XXXX_...(self, session, case_report, ...):
```

### 2. 函数 docstring（Arrange / Act / Assert）

```python
"""CSV {id}：{用例名称简述}。

Arrange:
    {前置与造数说明}
Act:
    {调用的 API 与关键参数}
Assert:
    {与 CSV 预期对齐的断言项列表}
"""
```

### 3. 行注释分段

```python
# --- Arrange：... ---
# --- Act：... ---
# --- Assert N：... ---
```

### 4. case_report API

| 方法 | 用途 | 对应 CSV |
|------|------|----------|
| `begin(title)` | 用例标题 | CSV「名称」 |
| `step(n, desc, detail="")` | 记录第 n 步 | CSV「测试步骤」序号行 |
| `check(expectation, ok, detail="")` | 记录预期校验 | CSV「预期结果」每条 |
| `attach_yaml(label, text)` | 附加 YAML 预览（超长截断） | 导出类用例 |
| `attach_text(label, text)` | 附加结构化文本 | 树结构、签名等 |

**顺序约定：** `begin` → 造数后 `step(1,...)` → Act 后 `step(2,...)` → 每条 `assert` 前/后配套 `check` → 最后 `attach_*`（在最终 assert 之前写入，确保失败时也有预览）。

### 5. CSV 步骤 → case_report 映射（通用）

| CSV 形态 | case_report |
|----------|-------------|
| `1. 前置/造数...` | `step(1, "...", f"project_id={pid}")` |
| `2. POST /xxx` | `step(2, "POST /seccenter/v2/...", f"body=...")` |
| `3. 检查返回...` | `step(3, "检查返回的 ...", f"解析成功，字段=...")` |
| 预期：包含 X 数组 | `check("JSON/YAML 包含 X 数组", ok, detail="...")` |
| 预期：结构与 DB 一致 | `check("导出结构与 DB 一致", tree_match, detail="...")` |

## 日志落盘

每次 `case_report` teardown：

1. 写入 `hytests/.test-reports/{case_id}_{nodeid_safe}.log`
2. 更新 `hytests/.test-reports/latest.log`（最近一次运行）
3. 终端打印路径横幅

### 完整日志在哪里看

| 场景 | 位置 |
|------|------|
| **推荐** | 打开 `hytests/.test-reports/latest.log` |
| 按用例 | `hytests/.test-reports/{case_id}_*.log` |
| 命令行 pytest | 测试摘要下方「用例验证摘要日志」区块 |
| Cursor / VS Code 测试面板 | 对 **PASSED** 用例默认只显示摘要；**必须打开 log 文件** 看 YAML 全文 |

终端还会在用例结束后打印：

```text
============================================================
[用例验证摘要] CSV 9909 完整日志:
  F:\...\hytests\.test-reports\9909_....log
  (快捷) hytests/.test-reports/latest.log
============================================================
```

## 中文终端输出

`plugins/pytest_zh_terminal.py` 提供：

| 原英文 | 中文 |
|--------|------|
| collected N items | 共收集 N 个测试 |
| PASSED | PASSED(通过) |
| FAILED | FAILED(失败) |
| short summary | 测试摘要 + 用例验证摘要日志列表 |

pytest 内置 `test session starts` 横幅仍为英文（框架限制）。

## 字符约束（Windows GBK）

报告与终端输出 **禁止** 使用以下 Unicode 符号（易在 GBK 终端乱码）：

- `▶` `✓` `✗` `→` `…`

改用 ASCII：`[通过]` `[失败]` `->` `...`

## 与 README 的关系

- 运行时日志 → `.test-reports/*.log`（动态）
- 静态设计说明 → `docs/automation/{case_id}.md` + `cases_registry.yaml` 的 `automation_doc` 字段 → `gen_readme.py` 嵌入 README

见 [[cases-registry-schema.md]]、`[[readme-format-rules.md]]`、[[../feature-skills/生成-README手册/SKILL.md]]。

## 存量迁移清单

1. `rg '@pytest.mark.csv_case' hytests/` 列出所有 marker
2. 与 `cases_registry.yaml` 中 `status: implemented` 取交集
3. 逐个补 `case_report` fixture + step/check
4. 复杂用例补 `docs/automation/{id}.md` + registry `automation_doc`
5. `python scripts/gen_readme.py`
6. 跑 G6 门禁（[[../feature-skills/质量-覆盖率自检/SKILL.md]]）

当前 backlog 示例：seccenter 仅 9909 完整接入；9910–9913 与其余 `test_csv_*.py` 待补。

## 黄金样本

- 代码：`seccenter/hytests/test_mvp_menu_9909_9913.py::test_csv_9909_export_project_menus_yaml`
- 日志：跑测后 `hytests/.test-reports/latest.log`
- automation_doc：`seccenter/hytests/docs/automation/9909.md`
