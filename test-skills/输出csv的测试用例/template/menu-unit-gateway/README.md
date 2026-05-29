# 菜单单元测试 → CSV 样本

本目录不重复 Python 脚本，统一使用 skill 根目录：

- `configs/menu-unit-gateway.config.json`
- `configs/menu-unit-gateway.cases.json`
- `scripts/generate_test_csv.py`

## 验证产物

- `sample-output.csv`：dry-run 生成的 36 行样本（与 `docs/问题单/0529/menu-unit-gateway.csv` 应对齐）

## 源 Vitest 文件（apex_dev）

- `src/gateway/__tests__/menu.gateway.test.ts`（14）
- `src/gateway/__tests__/menu-tree-helpers.test.ts`（3）
- `src/gateway/__tests__/menu-route-normalization.test.ts`（11）
- `src/api/__tests__/menu-system-only.test.ts`（3）
- `src/api/__tests__/menu-project-scope.test.ts`（3）
- `src/api/__tests__/menu-repo-cache.test.ts`（2）

跳过：`menu-stable-types.test.ts`（编译期类型）
