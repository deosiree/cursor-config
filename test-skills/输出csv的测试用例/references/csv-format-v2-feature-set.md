# CSV 格式 v2：功能集合 + 合并测试步骤（alarm_.csv 风格）

测试工具改版后，UI 用例按 **子系统 → 模块名 → 功能集合** 组织。本格式对齐 `docs/问题单/模板/alarm_.csv` 与 `tenant.csv`（0610 起）。

**CSV 导出格式（测试步骤合并、用例结果留空）见 [`csv-export-format-rules.md`](csv-export-format-rules.md)。**

## 与 v1（legacy UI 路径）对比

| 维度 | v1（`append_ui_cases_to_csv.py`） | v2（`generate_feature_csv.py`） |
|------|-----------------------------------|----------------------------------|
| 功能集合 | **强制留空** | **必填**，页面能力分类 |
| 测试步骤 | **合并** steps + expected | **合并** steps + expected |
| 用例结果 / 预期结果 | **留空** | **留空** |
| 子系统 | 常取 `8` | **从领域模板首行取**（如 tenant → `17`） |
| 模块名 | `租户管理` | **`租户管理界面`**（`XX界面` 后缀） |
| 输出方式 | 追加到 `docs/问题单/{date}/{domain}.csv` | **整文件覆盖** `--output` |
| 描述列 | 空或名称 | 自动：`{功能集合} — {direction} — {名称}` |
| 预留字段1 | 空 | UI 用例填 `ui` |
| remark / purpose | UI 不写 remark | **允许**（源码溯源、迁移备注） |

## cases.json v2 扩展字段

| cases 键 | CSV 列 | 必填 | 说明 |
|---------|--------|------|------|
| `name` | 名称 | ✅ | 单验证点，可独立检索 |
| `featureSet` | 功能集合 | ✅ | 测试工具中需已存在或提醒用户新建 |
| `expected` | （合并进测试步骤） | ✅ | cases.json 必填；CSV 用例结果列留空 |
| `precondition` | 前置条件 | ✅ | 登录、权限、环境 |
| `steps` | （合并进测试步骤） | ✅ | ≤7 步，动词开头 |
| `direction` | （写入描述） | 推荐 | `正向` / `逆向` / `边界` / `异常` |
| `caseType` | 用例类型 | 可选 | 显式覆盖；见 [`case-type-map.md`](case-type-map.md) |
| `level` | 用例等级 | 可选 | 数字，默认 0 |
| `purpose` | 用例目的 | 可选 | 源码落点简述 |
| `remark` | 备注 | 可选 | 实现细节、迁移来源 |
| `env` | 环境说明 | 可选 | 路由、环境 |
| `reserve1` | 预留字段1 | 推荐 `ui` | 区分 UI / API |
| `sortOrder` | 排序顺序 | 可选 | 同功能集合内排序 |
| `legacyId` | 用例ID | 仅迁移 | 保留旧 ID 时写入，否则留空 |

`fieldDefaults` 中 **不要** 写 `"用例结果": "0"` 或任何占位；**不要** 写 `"修改时间"`（导出留空，见 csv-export-format-rules 规则 F）。

## CSV 测试步骤合并示例

```text
测试步骤：
1. 进入「安全管理」>「租户管理」
2. 观察工具栏与表格
---
预期结果：
1. 页面标题为「租户列表」
2. 表格与分页正常渲染
```

## 常见功能集合（租户 0610 样本）

| 功能集合 | 典型场景 |
|----------|----------|
| 页面加载 | 首屏、权限守卫、空态 |
| 页面权限 | 按钮/筛选项按 perms 显隐 |
| 筛选查询 | 搜索、清空、无匹配 |
| 表格展示 | 列、排序、状态标签 |
| 分页 | 翻页、每页条数 |
| 界面布局 | 工具栏、操作列、列设置 |
| 弹窗交互 | 向导步骤、Tab、确认取消 |
| 表单校验 | 必填、格式、blur 校验 |
| 删除操作 | 单删、批删、二次确认 |
| 异常处理 | 接口失败 toast、业务错误回显 |

## 用例类型

完整映射、direction 分工、反例见 **[`case-type-map.md`](case-type-map.md)**（对齐 `docs/问题单/模板/types.csv`）。

撰写 v2 cases 时：**写 `direction`，不要指望 fieldDefaults 统一填 0**；`generate_feature_csv.py` 逐条推导 CSV `用例类型` 列。

新功能集合须在测试工具后台手动添加后，导入 CSV 才能正确归类。

## 生成命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/tenant.cases.json \
  --template ../../../docs/问题单/模板/tenant.csv \
  --output ../../../docs/问题单/0616/tenant.csv \
  --preserve-ids-from ../../../docs/问题单/0616/tenant.csv \
  --force
```

批量修复 0616 全部模块：

```bash
python scripts/regenerate_module_exports.py --preserve-ids --force
```

## 异常处理中的 mock 例外

v1 质量清单禁止步骤含 `mock`。v2 **异常处理** 功能集合下，当用例验证「业务错误 UI 回显」时：

- 步骤可写「通过 mock 使创建接口返回业务错误」
- **预期必须**描述用户可见：通知文案、弹窗状态、列表不变
- **禁止**在预期中断言 `handleGatewayError` 等内部函数名

## 参考样本

- cases：`configs/tenant.cases.json`
- CSV：`docs/问题单/0616/tenant.csv`（0616 合并格式）
- 历史预期校验：`docs/问题单/0615/`、`0610/`
- few-shot：`assets/few-shot-example/tenant-feature-set-reorg.md`
- 质量报告：`evals/tenant-reorg-0610.md`
