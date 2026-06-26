# pytest 目录布局决策树

## 何时用 seccenter 扁平编号（本 skill 默认）

- 独立后端服务仓库，根目录或 `tests/` 为唯一测试入口
- HTTP 黑盒，无进程内 import 被测模块
- 用例数预期 **>20**，需要 `test_01` → `test_NN` 执行阶段感
- 团队已习惯 `conftest.py` + `config.py` + `utils.py` 三件套

```
tests/
├── conftest.py
├── config.py
├── utils.py
├── pytest.ini
├── test_01_auth.py
└── test_03_tenant.py
```

`pytest_collection_modifyitems` 可按文件名排序（见 seccenter `conftest.py`）。

## 何时用共置目录（不本 skill 主路径）

- FastAPI / 单体内应用，TDD 红绿优先
- 大量 mock，`httpx.ASGITransport` 打本进程
- 用例数 <30，函数式即可

```
app/
├── conftest.py
├── services/tests/test_*.py
└── api/tests/test_*.py
```

→ terminology-agent 模式，见 `references/test-type-taxonomy.md`。

## 新建文件编号规则

1. 扫描现有 `test_*.py`，取最大 `NN` + 1
2. 同序号多文件允许（seccenter 有 `test_08_device.py` 与 `test_08_api_permission.py`），靠全名排序
3. 新模块名用英文 snake：`test_18_api_whitelist.py`

## pytest.ini 最小模板

```ini
[pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
markers =
    slow: 慢速测试
    integration: 集成测试
```

## 模板

- 空目录 before：[[../template/新模块骨架/before/SKILL.md]]
- 最小 after：[[../template/新模块骨架/after/SKILL.md]]
