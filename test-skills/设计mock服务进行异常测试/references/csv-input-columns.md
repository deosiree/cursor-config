# 自测 CSV 列名与字段映射（解析用）

> **非筛选规则**：用户已手动筛选用例后再传入 CSV。技能 **逐行解析全部行**，不丢弃、不二次过滤。

## 典型列名（云平台自测导出）

不同导出批次列名可能略有差异，解析时做别名匹配：

| 逻辑字段 | 常见列名 |
|----------|----------|
| `case_id` | `用例编号`、`用例ID`、`ID` |
| `name` | `用例名称`、`标题` |
| `module` | `模块`、`功能模块` |
| `steps` | `测试步骤`、`步骤` |
| `expected` | `预期结果`、`期望结果` |
| `priority` | `优先级` |
| `type` | `用例类型` |

## 解析输出（每行）

```yaml
case_id: "3545"
name: 列表接口失败时页面不白屏
module: 用户管理界面
steps: |
  1. 进入用户管理...
expected: |
  1. 页面不白屏...
```

## 与 mock 的映射（分析阶段补充）

| 分析字段 | 来源 |
|----------|------|
| `route` | 模块 → `src/router` 或已知路径表 |
| `mock_endpoint` | 步骤 + `src/api/*.api.ts` |
| `mock_error_code` | 业务约定或 mock 设计 |
| `scenario_active` | 默认等于 `case_id` |
| `required_perms` | 页面 `checkHasPerm` / `RoutePermDict` |

## caseIds 子集（可选）

用户可指定 `caseIds: 3545,3570` 仅处理 CSV 中部分行；**未指定则全量处理**。

## 缺列处理

- 缺 `case_id` → 记入 `missingFacts`，**STOP** 该行
- 缺 `steps` / `expected` → 用 `name` + 源码推断，在 registry `note` 标注
