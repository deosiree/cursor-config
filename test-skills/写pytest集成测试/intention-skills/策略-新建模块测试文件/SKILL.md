---
name: 策略-新建模块测试文件
description: 为新 API 域创建 test_NN_{module}.py，含策略型或简短文件头、首个 Test* 类与最小 CRUD 环。
---

# 策略：新建模块测试文件

## 何时触发

- `fileStrategy = new_numbered_file`
- 目标模块尚无对应 `test_*.py`
- 新接口域需独立文件（权限、隔离、统计类）

## 输入

| 字段 | 必填 |
|------|------|
| `moduleName` | 是 |
| `nextFileNumber` | 是（扫描现有最大 NN） |
| `scenarioType` | 是 |
| `targetRepo` | 是 |

## 执行步骤

1. 读 [[../../references/pytest-layout-conventions.md]] 确定 `test_{NN}_{module}.py` 文件名
2. 若 `tests/` 无三件套 → 先路由 [[../feature-skills/撰写-conftest与fixtures/SKILL.md]] + [[../feature-skills/撰写-utils断言助手/SKILL.md]]
3. 选文件头风格：
   - 简单 CRUD → 一行 docstring（见 [[../../assets/few-shot-example/租户CRUD最小样本/SKILL.md]]）
   - 权限/多场景 → 策略型（见 [[../../assets/few-shot-example/API权限策略文档头/SKILL.md]]）
4. 创建首个 `Test{Module}CRUD` 或 `Test{Feature}{Aspect}` 类
5. 至少 1 条 `test_*`：create → assert → cleanup
6. 更新 `tests/README.md` 模块条目（若存在）

## 输出

- 新 `test_NN_*.py` 路径
- 文件头场景列表
- 建议的后续 `策略-补场景用例`  backlog

## 边界

- 不一次塞入 >5 个 Test 类；先最小绿再扩
- 不修改 unrelated 已有 `test_*.py`

## 使用示例

```text
创建 test_18_api_whitelist.py，策略型文件头，TestApiWhitelistCRUD 含 create + delete 两条。
```
