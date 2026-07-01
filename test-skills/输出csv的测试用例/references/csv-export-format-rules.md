# CSV 导出格式规则（唯一权威源）

本文件是测试系统 CSV **导出格式** 的永久约束。所有 `generate_*_csv.py` 脚本与 Agent 生成/质检路径必须遵守。

cases.json 撰写层仍分别维护 `steps` 与 `expected`；**仅在 CSV 导出层** 按下列规则合并与留空。

## 规则 A：测试步骤合并格式（新增/更新均适用）

CSV「测试步骤」列必须写入以下结构（由 `build_combined_test_steps(steps, expected)` 生成）：

```text
测试步骤：
1. ...
2. ...
---
预期结果：
1. ...
2. ...
```

- 标题行固定为「测试步骤：」与「预期结果：」（全角冒号）
- 分隔符固定为单独一行 `---`
- `expected` 为空时仅输出「测试步骤：」段，不写 `---` 与「预期结果：」

### 正例

```text
测试步骤：
1. 进入「安全管理」>「租户管理」
2. 观察工具栏与表格
---
预期结果：
1. 页面标题为「租户列表」
2. 表格与分页正常渲染
```

### 反例

| 错误写法 | 原因 |
|----------|------|
| 测试步骤列仅写编号步骤、预期另填「用例结果」列 | 导入后再导出会丢失预期 |
| 「用例结果」列填 `0` 或预期正文 | 违反规则 B |
| 缺少「测试步骤：」标题或 `---` 分隔 | 测试系统无法稳定解析 |

## 规则 B：用例结果列永远留空

- CSV「用例结果」列（及旧模板「预期结果」列）**不写任何内容**
- 禁止写 `0`、禁止写预期正文
- 脚本须调用 `clear_result_columns(row, header)`
- cases.json 的 `expected` **仍必填**（撰写与质量自检在 JSON 层校验）

## 规则 F：修改时间列永远留空

- CSV「修改时间」列**不写任何内容**（含 `1970/1/1 0:00` 等占位）
- 由测试系统在导入/更新时自行维护
- 脚本须在 `clear_result_columns(row, header)` 中强制留空
- `fieldDefaults` / cases.json **不要**写 `"修改时间"`；历史 cases 中若存在，导出时仍会被脚本清空

## 规则 C：用例ID 仅更新场景保留

| 场景 | 用例ID |
|------|--------|
| **更新已有用例**（如 0616 修复再导入） | `generate_feature_csv.py --preserve-ids-from` 或 `regenerate_module_exports.py --preserve-ids`，按「名称」匹配回填 |
| **新增用例** | **留空**，由测试系统分配 |

禁止 Agent 为新增用例手写用例ID。

## 规则 D：增量导入（测试系统无法更新已有用例时）

当测试系统**不能更新**、相同用例ID 或同名用例只会跳过时：

| 行为 | 说明 |
|------|------|
| **0616 等增量目录** | 只写入 `cases.json` 中**基准 CSV 尚不存在**的用例 |
| **用例ID** | 全部留空（禁止回填旧 ID） |
| **脚本** | `--only-new-from` 或 `regenerate_module_exports.py --only-new-from-dir` |
| **无新增模块** | 不生成该模块 CSV 文件 |

基准目录通常为已导入快照（如 `docs/问题单/0616_v1/`）。主数据源仍是完整 `configs/*.cases.json`。

```bash
# 单模块：仅 4 条新用例
python scripts/generate_feature_csv.py \
  --cases configs/tenant.cases.json \
  --template ../../../docs/问题单/模板/tenant.csv \
  --output ../../../docs/问题单/0616/tenant.csv \
  --only-new-from ../../../docs/问题单/0616_v1/tenant.csv \
  --force

# 批量：各模块仅有新增时才写出
python scripts/regenerate_module_exports.py \
  --only-new-from-dir docs/问题单/0616_v1 \
  --force
```

| 组件 | 文件 |
|------|------|
| 合并/留空/ID 映射 / 自测人员 | `scripts/csv_step_format.py`（含用例结果、修改时间留空） |
| v2 功能集合导出 | `scripts/generate_feature_csv.py` |
| v1 UI 追加 | `scripts/append_ui_cases_to_csv.py` |
| API/test.ts 导出 | `scripts/generate_test_csv.py` |
| 批量修复 0616 等 | `scripts/regenerate_module_exports.py` |

## 规则 E：自测人员固定为「惠岩」

- CSV「自测人员」列（表头存在时）由 `csv_step_format.apply_skill_csv_defaults` **强制写入** `惠岩`
- 无需在 `fieldDefaults` / cases.json 重复填写；脚本在 `generate_feature_csv.py`、`generate_test_csv.py`、`append_ui_cases_to_csv.py` 导出前统一补齐

## 质量自检（CSV 层）

生成 CSV 后抽样确认：

1. 「测试步骤」含 `---` 与「预期结果：」（有 expected 的用例）
2. 「用例结果」列为空字符串（非 `0`）
3. 「修改时间」列为空字符串（非 `1970/1/1 0:00`）
4. 「自测人员」列为 `惠岩`（表头含该列时）
5. 更新场景下用例ID 与源 CSV 按名称一致；新增用例 ID 为空

## 历史备份校验

修复/迁移时，预期语义可对照历史 CSV 的「用例结果」列（导入前格式），例如：

| 模块 | 建议对照目录 |
|------|--------------|
| tenant / role / menu / login | `docs/问题单/0615/` |
| user / dashboard / securityConfig | `docs/问题单/0610/` |
| menu（补充） | `docs/问题单/0605/`、`0604/` |

主数据源始终是 `configs/*.cases.json` 的 `steps` + `expected`。

## Agent 禁止清单（dim9）

以下行为在 0616 实跑后已证实会导致导入失败或格式回退，**禁止**：

| # | 禁止 | 替代 |
|---|------|------|
| 1 | CSV「用例结果」列填 expected、`0` 或任何占位 | expected 写入 cases.json；脚本合并进「测试步骤」 |
| 1b | CSV「修改时间」列填 `1970/1/1 0:00` 或任何日期 | 留空；测试系统自行维护 |
| 2 | 为新增用例手写用例ID | 留空；测试系统分配 |
| 2b | 测试系统不能更新时仍全量导出并回填旧用例ID | 用 `--only-new-from` / `--only-new-from-dir`，0616 只含新增行 |
| 3 | UI 模块使用已退役的 `append_ui_cases_to_csv.py`（v1 追加） | 默认 `generate_feature_csv.py` / `regenerate_module_exports.py` |
| 4 | 使用 `patch_tenant_expected.py` 补预期 | 改 `configs/*.cases.json` 后重新生成 |
| 5 | 测试步骤列只写步骤、预期另列 | 必须用规则 A 合并格式（含 `---`） |
