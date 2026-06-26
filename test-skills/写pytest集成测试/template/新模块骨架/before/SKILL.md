---
name: 新模块骨架-before
description: 集成测试起步前的空目录或仅有 README 的状态（RED 基线）。
---

# Template Before：新模块骨架

## 典型现状

```
some-backend/
└── tests/
    └── README.md    # 或完全无 tests/
```

## 缺失信号

- 无 `conftest.py` / `config.py` / `utils.py`
- 无 `pytest.ini`
- 无 `test_*.py`
- 无 `requirements.txt`（pytest、requests）

## RED 应记录

- `targetRepo`、`baseUrl`、首个 `moduleName`
- 是否可复用 sibling 项目（如 seccenter）三件套
- `nextFileNumber`（通常 `01` 或接最大序号）

## 不要在此阶段

- 写具体 `test_*` 业务断言（留给 after）
- 引入 `unittest.mock`
