---
name: 分析-CSV异常用例
description: 读取用户已筛选的 csvPath，逐行解析全部用例，输出 mock/API/页面/预期 UI 分析表；不做二次筛选。
---

# 分析：CSV 异常用例

## 何时触发

- 用户传入 `csvPath`（已手动筛选过的自测 CSV）
- 父 skill RED 阶段，或 `策略-新增异常Mock用例` 第一步

## 何时不触发

- 用户未提供 `csvPath` 且无法定位 CSV
- 仅润色已有 README、不涉及新用例

## 输入

| 字段 | 必填 | 说明 |
|------|------|------|
| `csvPath` | 是 | 自测 CSV 路径 |
| `targetRepoProfile` | 否 | 默认 `apex_dev` |
| `caseIds` | 否 | 子集；未指定则 **CSV 全量** |

## 执行步骤

1. 读 [[../../references/csv-input-columns.md]] 解析列名
2. 逐行提取 `case_id`、`name`、`module`、`steps`、`expected`
3. 读 [[../../references/target-repo-profiles.md]] 得 `repo_root`
4. 对每行结合源码：
   - 定位 `mock_endpoint`（含 `forward/`）
   - 推断 `route`、`mock_error_code`、预期 toast 文案
   - 查 `checkHasPerm` / `RoutePermDict` → `required_perms`
5. **权限不确定** → 该行 `perm_status: pending_human`，不猜 permissions
6. 输出分析表，**不丢弃任何 CSV 行**

## 输出

```yaml
csvAnalysis:
  csvPath: ...
  rows:
    - case_id: "3545"
      name: ...
      route: /cloud/Apex/system/user
      mock_endpoint: POST forward/seccenter/v2/user/list
      mock_error_code: 40001
      scenario_active: "3545"
      perm_status: ok
      required_perms: [sys:user:query]
      expected_ui: [页面不白屏, toast含加载用户列表失败]
```

## 边界

- **禁止**按用例类型/模块二次筛选或跳过行
- 缺 `case_id` → 记入 `missingFacts`，STOP
- CSV 环境列含 `microfb :8080` 且为基座菜单链路 → `targetRepoProfile: microfb`，`test_mode: microfb-8080-scenario`，见 [[../../references/手工自测流程-8080基座mock.md]]
- 其余子应用用例 → 默认 `apex_dev` + 8081 方案 A

## 使用示例

```text
csvPath=docs/自测单/异常处理_已筛选.csv，全量解析并输出分析表。
```
