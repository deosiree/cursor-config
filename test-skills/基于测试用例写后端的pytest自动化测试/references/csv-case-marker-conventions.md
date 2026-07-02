# csv_case 标记与命名约定

## pytest.ini 注册

```ini
markers =
    csv_case(case_id): map to CSV case ID
    blocked: cannot run in HTTP-only environment
```

## 装饰器

每个 CSV 用例 **至少**一行：

```python
@pytest.mark.csv_case("9909")
def test_csv_9909_export_project_menus_yaml(self, session, clean_isolated_projects):
    """9909: 导出项目菜单配置为 YAML，含 M1(2 API) + M2。"""
```

### 多装饰器顺序

blocked 用例（gRPC / 会话 SDK）：

```python
@pytest.mark.csv_case("9971")
@pytest.mark.blocked
def test_csv_9971_get_user_id_blocked():
    pytest.skip("CSV 9971: requires gRPC session SDK client")
```

`scan_markers` 在遇 `def` 前保留 pending marker，中间可夹 `@pytest.mark.blocked`。

## 命名约定

| 元素 | 规则 | 示例 |
|------|------|------|
| 文件 | `test_csv_{模块}.py` 或 `test_mvp_{范围}.py` | `test_mvp_menu_9909_9913.py` |
| 类 | `TestCsv{Feature}{Range}` | `TestCsvMenuMvp9909_9913` |
| 方法 | `test_csv_{case_id}_{slug}` | `test_csv_9909_export_project_menus_yaml` |
| docstring | 首行含 `{case_id}:` + 中文说明 | `"""9909: 导出..."""` |

`slug` 用英文 snake_case，简短描述场景，不必与 CSV 名称完全一致。

## 文件组织

| 策略 | 何时用 |
|------|--------|
| MVP 批次文件 | 首次落地 5–15 条相关 ID | `test_mvp_menu_9909_9913.py` |
| 模块文件 | 同一功能集合持续追加 | `test_csv_auth.py`、`test_csv_whitelist.py` |
| SDK blocked 专文件 | 全部 skip | `test_csv_session_sdk.py` |

## 与 CSV 对齐检查

```bash
# 扫描 marker
rg 'csv_case\s*\(\s*["\']\d+["\']' hytests/test_*.py

# 覆盖率脚本
python scripts/csv_coverage.py
```

同一 `case_id` **不应**出现在多个 test 文件（coverage 会报 duplicate）。

## 断言与 fixture

- HTTP 用例：复用 `session`、`clean_isolated_projects` 等（见 `conftest.py`）
- 断言：`assert_success` / `assert_error`（[[../../写pytest集成测试/feature-skills/撰写-utils断言助手/SKILL.md]]）
- API 路径：经 `seccenter_url()` 或 helper 封装，与 CSV 步骤 `/menu/create` 对应 `/seccenter/v2/menu/create`

## 反模式

- 无 `@pytest.mark.csv_case` 的 hytests 用例（无法进 README 实现位置）
- case_id 与函数名数字不一致（如 marker `"9909"` 但函数 `test_csv_9910_*`）
- 在 `tests/` 官方套件加 csv_case（应只在 `hytests/`）
