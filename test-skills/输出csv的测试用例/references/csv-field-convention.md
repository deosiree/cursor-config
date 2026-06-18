# CSV 字段约定（测试系统导入）

对齐 `docs/问题单/模板/*.csv` 表头，36 列。

**CSV 导出格式（测试步骤合并、用例结果留空、用例ID 规则）以 [`csv-export-format-rules.md`](csv-export-format-rules.md) 为唯一权威源。** 下文仅描述 cases.json 与 CSV 列映射。

本套件存在 **两条 UI 路径**，RED 阶段须先判定 v1 或 v2：

| 路径 | 脚本 | 功能集合 | CSV 预期列 |
|------|------|----------|------------|
| **v1** legacy | `append_ui_cases_to_csv.py` | **留空** | **留空**（预期合并进测试步骤） |
| **v2** 功能集合 | `generate_feature_csv.py` | **必填** | **留空**（预期合并进测试步骤） |

v2 完整说明见 [`csv-format-v2-feature-set.md`](csv-format-v2-feature-set.md)。

## 留空列

| 列 | 说明 |
|----|------|
| 用例ID | 新增留空；更新场景 `--preserve-ids-from` 回填 |
| 用例结果 / 预期结果 | **永远留空**（见 csv-export-format-rules 规则 B） |
| 功能集合 | **v1 强制留空** |

## v2 必填列（cases.json + CSV）

| 列 | 说明 |
|----|------|
| 功能集合 | 页面能力分类（测试工具须已配置） |
| 测试步骤 | **合并格式**：`测试步骤：` + 步骤 + `---` + `预期结果：` + expected |
| cases.json `expected` | **必填**（导出时不写入 CSV 用例结果列） |

## UI 交互路径 v1（与 API / test.ts 路径并列）

见 [`ui-interaction-test-case-rules.md`](ui-interaction-test-case-rules.md)。

| 列 | UI 用例约定 |
|----|-------------|
| 前置条件 | 登录、菜单位置、环境 |
| 测试步骤 | 合并格式（见 csv-export-format-rules） |
| 用例结果 / 预期结果 | **留空** |
| develop结果 | 0（测试系统约定：未执行） |
| 功能集合 | **v1 留空**；v2 必填 |

## v2 UI 路径（功能集合重组）

| 列 | v2 约定 |
|----|---------|
| 功能集合 | 页面能力分类（页面加载、表格展示、异常处理…） |
| 测试步骤 | 合并 `steps` + `expected`（脚本生成） |
| 用例结果 | **留空** |
| 描述 | 自动生成：`{功能集合} — {direction} — {名称}` |
| 用例目的 / 备注 | 可选，源码溯源与迁移备注 |
| 预留字段1 | UI 用例填 `ui` |
| 子系统 | 从领域模板取（tenant → `17`） |
| 模块名 | `XX界面`（如 `租户管理界面`） |
| 用例类型 | **v2 不写 defaults**；由 `direction`/`featureSet` 推导，见 [`case-type-map.md`](case-type-map.md) |

## 固定默认值（菜单 / API v1 样本）

| 列 | 值 |
|----|------|
| 标签 | 1 |
| 执行方式 | 4 |
| 最新结果 | 0 |
| 创建人员 | 惠岩（换模块时在 config 覆盖） |
| 用例等级 | 0 |
| 用例类型 | 0（**仅 v1/API**；v2 见 [`case-type-map.md`](case-type-map.md)） |
| develop结果 | 0 |
| 子系统 | 8 |
| 模块名 | 菜单管理 |

## 用例行字段（来自 cases.json）

| cases 键 | CSV 列 | 说明 |
|---------|--------|------|
| name | 名称 | |
| featureSet | 功能集合 | v2 必填 |
| precondition | 前置条件 | |
| steps + expected | 测试步骤 | 脚本合并，见 csv-export-format-rules |
| purpose | 用例目的 | v2 可选 |
| remark | 备注 | |
| reserve1 | 预留字段1 | |
| sortOrder | 排序顺序 | |
| direction / caseType | 用例类型 | v2 推导 |

## cases.json 中 expected 格式

UI 用例：编号列表，界面语言。

API 用例：可用 `正向：` / `反向：` 前缀（合并进测试步骤的「预期结果：」段）。

仅写步骤中放不下的最终判定；步骤已描述的操作勿重复。
