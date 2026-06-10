---
name: legacy-export迁移重组
description: 从 testcases_export.csv 按创建人员筛选旧用例，按功能集合 v2 重组、对照源码补充，生成单文件 tenant.csv 等。
---

# legacy export 迁移重组（功能集合 v2）

## 何时触发

- 用户说「从 testcases_export 迁移 XX 模块用例」「按功能集合重组租户用例」
- 测试工具改版，需对齐 `alarm_.csv` / `tenant.csv` 新表头
- 旧体系中 **功能集合列填的是模块名**（如「租户管理」），新体系功能集合为页面能力分类

## Input（RED 最少字段）

| 字段 | 说明 |
|------|------|
| `exportCsv` | 默认 `docs/问题单/模板/testcases_export.csv` |
| `创建人员` | 筛选列，如 `惠岩` |
| `旧功能集合` | 旧体系模块名，如 `租户管理` |
| `domain` / 模板 | 如 `tenant` → `docs/问题单/模板/tenant.csv` |
| `date` | 输出目录 MMDD，如 `0610` |
| `模块名` | 从模板取，如 `租户管理界面`（非旧名「租户管理」） |
| `子系统` | **从模板首行取**，不沿用旧 export 的 `8` |

## Green 工作流

### 1. 筛选旧用例

从 `testcases_export.csv` 读取，条件：

```
创建人员 = {创建人员} AND 功能集合 = {旧功能集合}
```

记录：原用例 ID、名称、步骤、备注 → 建立 **迁移映射表**（一条旧用例可拆多条新用例）。

### 2. 归类到新功能集合

按页面能力拆分，参考 `references/csv-format-v2-feature-set.md` 功能集合表。

典型处置：

| 旧用例主题 | 新功能集合 | 处置 |
|-----------|------------|------|
| 操作列/更多 | 界面布局 | 拆多条 |
| 弹窗/向导 | 弹窗交互 | 按步骤拆 |
| 删除 | 删除操作 | 单删/批删/确认 |
| gateway 错误 | **异常处理** | 改为 UI 验收，非纯 API |
| 表单校验 | 表单校验 | 按字段/规则拆 |

### 3. 对照源码补充

阅读 `src/views/**`、`src/components/**`，补充：

- 权限守卫（页面权限）
- 列表/分页/筛选（表格展示、筛选查询、分页）
- 未覆盖的边界与异常

### 4. 撰写 cases.json

- 路径：`configs/{domain}.cases.json`（如 `tenant.cases.json`）
- 每条必填：`name`、`featureSet`、`expected`、`precondition`、`steps`
- **推荐**写 `direction`（`正向`/`逆向`/`边界`/`异常`），供脚本推导 **用例类型**（见 `references/case-type-map.md`）
- `fieldDefaults`：子系统、模块名、创建人员从模板 RED 确认；**勿**在 defaults 写 `"用例类型": "0"` 覆盖全部
- 迁移用例在 `remark` 注明「迁移自原用例 {id}」

### 5. G2 预览

展示 2 条样例 + 总条数 + **功能集合分布表** + **需手动添加的功能集合清单**。

### 6. 生成 CSV（整文件覆盖）

```bash
python scripts/generate_feature_csv.py \
  --cases configs/{domain}.cases.json \
  --template ../../../docs/问题单/模板/{domain}.csv \
  --output ../../../docs/问题单/{date}/{domain}.csv \
  --force
```

**不走** `append_ui_cases_to_csv.py`（该脚本强制清空功能集合，与 v2 冲突）。

### 7. 质量自检

`用例质量自检`，`path_type=ui-v2`（见 `case-quality-checklist.md` H2/L/L2）。

### 8. 产出质量报告

写入 `evals/{domain}-reorg-{date}.md`：迁移表、分布、复跑命令、手动添加功能集合提醒。

## Output

- `configs/{domain}.cases.json`
- `docs/问题单/{date}/{domain}.csv`
- `evals/{domain}-reorg-{date}.md`（可选）

## Boundary

- **不迁移**未指定创建人员的用例
- **不拆**独立 API CSV；同一 `{domain}.csv` 靠功能集合列过滤
- **不猜测**子系统：必须从模板 CSV 读取
- 428 类「gateway 错误」→ 异常处理 + mock UI，功能集合不是「接口联调」

## Example

```text
用户：从 testcases_export 迁移惠岩的租户管理 5 条，按功能集合重组，对照源码补充，输出 0610/tenant.csv
Agent：
  筛选 5 条 → 映射拆分为 15+ 条 → 源码补充至 46 条
  → tenant.cases.json → generate_feature_csv.py → evals/tenant-reorg-0610.md
```
