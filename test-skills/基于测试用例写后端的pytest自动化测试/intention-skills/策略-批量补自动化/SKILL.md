---
name: 策略-批量补自动化
description: 在已有 hytests 上追加 case_id：扩展 test_csv_*.py、registry、gen_readme。
---

# 策略：批量补自动化

## 何时触发

- `hytests/` 已存在，目标 `caseIds` 部分 pending
- 用户要求「补 9919–9924」「菜单 155–160 自动化」
- `fileStrategy` 等价于 append_to_existing

## 执行步骤

1. [[../../intention-skills/分析-CSV自动化现状/SKILL.md]] 确认缺口（可选）
2. 选择目标文件：
   - 同模块已有 `test_csv_{module}.py` → 追加
   - 否则新建模块文件或 MVP 文件
3. → [[../../feature-skills/撰写-csv_case标记测试/SKILL.md]] 追加方法
4. → [[../../feature-skills/撰写-cases_registry条目/SKILL.md]] 追加条目
5. 跑 `pytest -k {case_id} -v` 验证新增 ID
6. → [[../../feature-skills/质量-覆盖率自检/SKILL.md]]
7. → [[../../feature-skills/生成-README手册/SKILL.md]]

## 追加 vs 新建文件

| 信号 | 决策 |
|------|------|
| 同功能集合已有 test_csv_* | 追加类或方法 |
| 新子系统 / SDK | 新建 `test_csv_integration_sdk.py` 等 |
| 单文件 >400 行 | 按 ID 范围拆文件 |

## 输出

- 修改文件列表 + 新增 `test_csv_{id}_*` 清单
- registry 增量
- 覆盖率前后对比

## 使用示例

```text
批量补 CSV 9919-9924 到 test_csv_auth.py / test_csv_whitelist.py，更新 registry 并重生成 README。
```
