---
name: 策略-迁移存量接口
description: 从 Swagger 或口述接口清单生成 test_*.py 骨架与场景 backlog，不一次性写满全部断言。
---

# 策略：迁移存量接口

## 何时触发

- 用户提供 `swagger.json` / OpenAPI 路径清单
- 口述「这些接口要有集成测试」
- 从 Postman 集合迁到 pytest

## 输入

| 字段 | 必填 |
|------|------|
| `swaggerPath` 或接口列表 | 是 |
| `moduleName` | 是 |
| `targetRepo` | 是 |

## 执行步骤

1. 按 tag / 路径前缀分组 → 映射到 `test_NN_{module}.py`（已有则 append，无则新建）
2. 每个接口至少规划：
   - 正向：`assert_success`
   - 反向（若有）：`assert_error` / 403 / 参数校验
3. 写 **策略型文件头**：列出测试场景编号（不必一次实现全部）
4. 优先生成 **1 条可跑通的最小环**（通常 create 或 query），其余记 `pytestOutputPlan.backlog`
5. 需要契约字段时，可读 nebula `seccenter-api-contract` skill 的 swagger 路径

## 输出契约

```text
pytestOutputPlan:
  files: [{ path, newClasses, newTests }]
  backlog: [{ endpoint, scenario, priority }]
  missingFacts: [...]
```

## 边界

- 不编造未在 swagger 出现的 path
- 第一批不实现 >3 个完整 Test 类；先绿一条再扩

## 使用示例

```text
根据 seccenter.swagger.json 的 /tenant/suspend，在 test_03_tenant.py 规划场景并先实现 suspend 后 verify 失败一条。
```
