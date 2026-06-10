# 用例类型映射（对齐 types.csv）

测试工具「用例类型」下拉与 CSV 列 **`用例类型`** 的数值编码，以 `docs/问题单/模板/types.csv` 为真源。

## types.csv 编码表

| 名称（types.csv） | CSV `用例类型` | 测试工具显示 | 执行方式 |
|-------------------|----------------|--------------|----------|
| `function` | `0` | 功能测试 | 手动 |
| `error` | `1` | 异常测试 | 手动 |
| `yali` | `2` | 压力测试 | 手动 |
| `bianjie` | `3` | 边界测试 | 手动 |

> 0610 批次 UI 用例以 **功能(0) / 异常(1) / 边界(3)** 为主；当前无压力测试样本。

## v2 路径：cases → CSV 推导规则

`generate_feature_csv.py` 在写出每行时调用 `resolve_case_type()`，**覆盖** `fieldDefaults.用例类型`。

| 优先级 | cases 条件 | 输出 `用例类型` |
|--------|------------|-----------------|
| 1（显式） | `"caseType": "error"` 或 `"caseType": "1"` | 按 `caseType` |
| 2（推导） | `direction=异常` **或** `featureSet=异常处理` | `1` 异常测试 |
| 3（推导） | `direction=边界` | `3` 边界测试 |
| 4（推导） | `direction=压力` 或 `featureSet=压力测试` | `2` 压力测试 |
| 5（默认） | `direction=正向` / `逆向` 或未写 direction | `0` 功能测试 |

### direction 与用例类型分工

| `direction` | 典型场景 | 推导类型 | 说明 |
|-------------|----------|----------|------|
| `正向` | 正常流程、权限具备、保存成功 | 功能测试 `0` | 默认 |
| `逆向` | 无权限隐藏按钮、不可删当前用户 | 功能测试 `0` | 负向路径仍属功能验证 |
| `边界` | 表单长度/格式临界、空列表、不可选行 | 边界测试 `3` | 与 `featureSet=表单校验` 常组合 |
| `异常` | 接口失败、业务错误 toast、页面不崩溃 | 异常测试 `1` | 常与 `featureSet=异常处理` 组合 |

**撰写时**：方向写 `direction`，**不要**在 `fieldDefaults` 里统一写 `"用例类型": "0"` 指望覆盖全部用例——脚本会按每条 case 重算。

### caseType 显式覆盖（可选）

单条 case 可写语义键或数字：

```json
{ "caseType": "error", "featureSet": "删除操作", "direction": "异常", "...": "..." }
{ "caseType": "3", "featureSet": "表单校验", "direction": "边界", "...": "..." }
```

语义键：`function` / `error` / `yali` / `bianjie`。

## 撰写示例

### 功能测试（默认）

```json
{
  "name": "用户列表页面初始加载展示工具栏表格与分页",
  "featureSet": "页面加载",
  "direction": "正向",
  "expected": "1. 表格与底部分页正常渲染"
}
```

→ CSV `用例类型=0`

### 异常测试

```json
{
  "name": "列表接口失败时页面不白屏",
  "featureSet": "异常处理",
  "direction": "异常",
  "expected": "1. 页面展示空态或错误提示\n2. 无白屏、无未捕获报错弹窗"
}
```

→ CSV `用例类型=1`

### 边界测试

```json
{
  "name": "租户名称超128字符校验失败",
  "featureSet": "表单校验",
  "direction": "边界",
  "expected": "1. 「租户名称」下方显示长度错误提示\n2. 无法提交"
}
```

→ CSV `用例类型=3`

## fieldDefaults 约定

| 路径 | `fieldDefaults.用例类型` |
|------|--------------------------|
| **v2**（`generate_feature_csv.py`） | **不写**或仅作占位；生成时按上表逐条覆盖 |
| **v1 / API**（`generate_test_csv.py`、`append_ui_cases_to_csv.py`） | 可固定 `"0"`（功能测试） |

v2 骨架 `template/tenant-feature-set/ui-case-v2-skeleton.json` 已移除该字段。

## 0610 批次分布（参考）

| 模块 | 功能 0 | 异常 1 | 边界 3 |
|------|--------|--------|--------|
| tenant | 34 | 5 | 7 |
| dashboard | 17 | 2 | 0 |
| user | 27 | 2 | 2 |
| role | 20 | 2 | 3 |
| securityConfig | 14 | 2 | 3 |

## 脚本落点

- 推导逻辑：`scripts/generate_feature_csv.py` → `resolve_case_type()`
- 真源样本：`docs/问题单/模板/types.csv`
- cases 样本：`configs/tenant.cases.json`（含四种 direction 混排）

## 不要做

- ❌ v2 全部写 `"用例类型": "0"` 且每条 `direction=异常` — 导入后全显示「功能测试」
- ❌ 在名称加 `[异常]` 前缀代替 `direction` — 名称规范见 `ui-interaction-test-case-rules.md`
- ❌ 把「无权限不展示按钮」标成异常测试 — 应 `direction=逆向` + 功能测试 `0`
