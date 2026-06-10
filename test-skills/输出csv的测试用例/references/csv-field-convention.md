# CSV 字段约定（测试系统导入）

对齐 `docs/问题单/模板/*.csv` 表头，36 列。

本套件存在 **两条 UI 路径**，RED 阶段须先判定 v1 或 v2：

| 路径 | 脚本 | 功能集合 | 预期列 |
|------|------|----------|--------|
| **v1** legacy | `append_ui_cases_to_csv.py` | **留空** | `预期结果` |
| **v2** 功能集合 | `generate_feature_csv.py` | **必填** | **`用例结果`** |

v2 完整说明见 [`csv-format-v2-feature-set.md`](csv-format-v2-feature-set.md)。

## 留空列（v1）

| 列 | 说明 |
|----|------|
| 用例ID | 导入后由系统分配 |
| 功能集合 | **v1 强制留空** |

## v2 必填列

| 列 | 说明 |
|----|------|
| 功能集合 | 页面能力分类（测试工具须已配置） |
| 用例结果 | cases 键 `expected`，编号列表 |
| 用例ID | 仍留空（迁移可写 `legacyId` 到 remark） |

## UI 交互路径 v1（与 API / test.ts 路径并列）

见 [`ui-interaction-test-case-rules.md`](ui-interaction-test-case-rules.md)。

| 列 | UI 用例约定 |
|----|-------------|
| 前置条件 | 登录、菜单位置、环境 |
| 测试步骤 | 编号操作步骤，≤7 步 |
| 预期结果 | 界面可验收描述（Tab 名、toast、红字） |
| develop结果 | 0（测试系统约定：未执行） |
| 功能集合 | **v1 留空**；v2 必填 |

预期结果 **不用** `正向：` / `反向：` 前缀（那是 API/test.ts 路径格式）。

## v2 UI 路径（功能集合重组）

| 列 | v2 约定 |
|----|---------|
| 功能集合 | 页面能力分类（页面加载、表格展示、异常处理…） |
| 用例结果 | cases 键 `expected`，**必填** |
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

| cases 键 | CSV 列（v1） | CSV 列（v2） |
|---------|-------------|-------------|
| name | 名称 | 名称 |
| featureSet | — | 功能集合 |
| precondition | 前置条件 | 前置条件 |
| steps | 测试步骤 | 测试步骤 |
| expected | 预期结果 | **用例结果** |
| purpose | — | 用例目的 |
| remark | 备注 | 备注 |
| reserve1 | — | 预留字段1 |
| sortOrder | — | 排序顺序 |
| direction / caseType | — | 用例类型（v2 推导，见 [`case-type-map.md`](case-type-map.md)） |

## 预期结果格式

红绿测试风格，**名称不加正反向前缀**：

```
正向：请求体 projectId 为 "51"；接口成功
反向：仍含 PROJECT-- 前缀；或保存失败
```

仅写步骤中放不下的最终判定；步骤已描述的操作勿重复。
