# Few-shot：菜单 gateway/api test.ts → CSV

## 会话结论

- 36 条用例来自 6 个 test 文件（跳过 `menu-stable-types.test.ts`）
- 名称无 `[正向]` 前缀；正反向写在「预期结果」
- 用例ID、功能集合留空；develop结果=0

## 拆分规则

| 规则 | 示例 |
|------|------|
| 多 expect 拆行 | route normalization 8+3 行 |
| 正反向合并 | findNodeById 存在/不存在一行 |
| 跳过编译期 | expectTypeOf → Vitest only |

## 脚本演进

1. 单文件 `generate_menu_unit_csv.py`（历史，docs/0529）
2. 拆为 `menu-unit-gateway.config.json` + `menu-unit-gateway.cases.json`
3. 通用 `generate_test_csv.py` 服务所有模块

## 字段默认值（菜单）

标签=1，执行方式=4，最新结果=0，创建人员=惠岩，用例等级=0，用例类型=0，develop结果=0，子系统=8，模块名=菜单管理

## 换租户模块时

1. `csv_to_test_config.py --reference-csv docs/问题单/模板/tenant.csv --module-id tenant-unit`
2. 口述覆盖 `模块名`、`创建人员`
3. `基于test.ts生成` 写 cases
4. `generate_test_csv.py` 出 CSV
