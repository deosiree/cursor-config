---
name: 质量-集成测试自检
description: 集成测试产出后的门禁：命名、docstring、清理、TEST_AUTO_、无 mock、环境变量。
---

# Feature：质量-集成测试自检

## 触发

每次 `test_*.py` / `conftest.py` / `utils.py` 产出或修改后 **强制** 执行。

## 检查清单

### G1 结构与命名

- [ ] 文件匹配 `test_*.py`，类 `Test*`，方法 `test_*`
- [ ] 文件名含模块语义或序号 `test_NN_*`
- [ ] 无 `unittest.mock` / `pytest-mock` 业务 HTTP mock

### G2 注释

- [ ] 文件首行 docstring（复杂模块含「测试策略」）
- [ ] 每个 `Test*` 类有中文 docstring
- [ ] 每个 `test_*` 有中文 docstring

### G3 数据与清理

- [ ] 可变测试数据经 `generate_unique_name` 或 `TEST_AUTO_` 前缀
- [ ] 创建实体有 delete / fixture teardown / `safe_cleanup`
- [ ] 无硬编码他人 tenant/user id（系统只读 id 除外）

### G4 断言链

- [ ] 使用 `assert_success` / `assert_error`，非裸 `resp.status_code == 200`
- [ ] 关键字段兼容 camelCase / snake_case
- [ ] 失败信息含 `msg="ApiName"` 便于定位

### G5 配置

- [ ] `BASE_URL`、凭证可环境变量覆盖
- [ ] 未提交真实生产密码到仓库

## 输出

```text
qualityReport:
  passed: bool
  violations: [{ rule, file, line?, fix }]
```

`passed=false` 时 **不得** 进入 Darwin evaluate；先修再评。

**🔴 CHECKPOINT**：`violations` 非空时只输出 `qualityReport`，**STOP** 交付。

## 与 Darwin 关系

通过后 → [[../../evals/evaluate-only-baseline.md]]
