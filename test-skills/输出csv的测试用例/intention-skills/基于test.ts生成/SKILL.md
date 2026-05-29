---
name: 基于test.ts生成
description: 扫描 Vitest test.ts，按路径路由 api/gateway feature 撰写 cases.json，再调用 generate_test_csv.py 输出 CSV。
---

# 基于 test.ts 生成测试用例

## 输入契约

- `repoRoot`：仓库根（如 `apex_dev` 或 nebula 下的子应用路径）
- `testPaths` 或 `testGlob`：如 `src/gateway/__tests__/menu*.test.ts`
- `moduleId`：如 `menu-unit-gateway`
- `csvTemplatePath`：默认 `docs/问题单/模板/menu.csv`
- `fieldDefaults` 覆盖：模块名、子系统、创建人员（若 config 未建，先走 `沉淀模块配置`）

## GREEN 工作流

1. **扫描**：列出 `describe` / `it`，统计条数
2. **分类**：
   - `expectTypeOf`、纯编译期 → 跳过 CSV，记入 README `skippedTests`
   - 多 `expect` 的 `it` → 拆成多行 cases
   - 正反向合并场景（如 findNodeById 存在/不存在）→ 一行，预期分 `正向：` / `反向：`
3. **路由 feature**：

| 路径 | Feature |
|------|---------|
| `src/gateway/**/__tests__/**` | `[[../../feature-skills/gateway-基于test.ts生成/SKILL.md]]` |
| `src/api/**/__tests__/**` | `[[../../feature-skills/api-基于test.ts生成/SKILL.md]]` |
| 其他（store/utils/views） | api feature 兜底 + 触发 Darwin |

4. **产出** `configs/{moduleId}.cases.json`：

```json
{
  "moduleId": "menu-unit-gateway",
  "cases": [
    {
      "name": "...",
      "precondition": "...",
      "steps": "1. ...\n2. ...",
      "expected": "正向：...\n反向：...",
      "remark": "file.test.ts > it(\"...\")"
    }
  ]
}
```

5. **生成 CSV**：`python scripts/generate_test_csv.py --config configs/{moduleId}.config.json`
6. **Darwin**：`[[../../feature-skills/darwin拓展发现/SKILL.md]]`

## 输出契约

- `cases.json` 路径与条数
- `skippedTests` 列表
- `remark` 溯源覆盖率
- 生成的 `outputPath` CSV

## 菜单样本

见 `configs/menu-unit-gateway.cases.json`（36 条，由 `scripts/bootstrap_menu_cases.py` 从会话脚本迁移）。
