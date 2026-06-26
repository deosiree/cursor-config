---
name: 策略-补场景用例
description: 在已有 test_*.py 内追加 Test* 类或 test_* 方法，保持 seccenter 注释与清理规范。
---

# 策略：补场景用例

## 何时触发

- `fileStrategy = append_to_existing`
- 已有 `test_NN_{module}.py`，需加正向/反向/边界场景
- Bug 回归：针对单接口补一条

## 执行步骤

1. 打开目标文件，扫描现有 `Test*` 类名，决定 **追加到已有类** 或 **新建类**
2. 类命名：`Test{Feature}{Aspect}`，与 [[../../references/seccenter-anatomy.md]] 一致
3. 方法命名：`test_{action}_{scenario}`；中文 docstring 必填
4. 按 `scenarioType` 选 feature：
   - `CRUD` → [[../feature-skills/撰写-CRUD类用例/SKILL.md]]
   - `isolation` / `permission` → [[../feature-skills/撰写-权限隔离类用例/SKILL.md]]
   - `e2e_flow` → [[../feature-skills/撰写-多步E2E流程/SKILL.md]]
5. 产出后 → [[../feature-skills/质量-集成测试自检/SKILL.md]]

## 追加 vs 新建类

| 信号 | 决策 |
|------|------|
| 同行为域（如 CRUD 再加 update） | 追加到 `TestXxxCRUD` |
| 新切面（如 SoftDeleteReuse） | 新建 `TestXxxSoftDeleteReuse` |
| 文件已 >800 行 | 考虑 `策略-新建模块测试文件` 拆文件 |

## 输出

- 修改的文件路径
- 新增 `test_*` 列表与场景说明
- 依赖的新 fixture（若有）

## 使用示例

```text
在 test_07_user.py 的 TestUserLocking 增加 test_locked_user_cannot_login 反向用例。
```
