---
name: api-基于test.ts生成
description: 将 src/api/**/__tests__/** 的 Vitest 用例撰写为 cases.json 行（偏 helper、缓存、项目默认值、localStorage）。
---

# api 层：基于 test.ts 生成用例

## 适用路径

- `src/api/__tests__/**/*.test.ts`
- `src/services/**` 相关测试（若落在 api 目录）

## 撰写规则

1. **名称**：简洁动作，不含 `[正向]`/`[反向]` 前缀
2. **步骤**：可执行 UI/工具操作；避免 `MenuGateway.xxx`
3. **验证**：
   - localStorage → F12 Application
   - 项目下拉默认值 → 进入页面查看选中项
   - mock 映射 → F12 Network 请求体字段
4. **预期**：`正向：…` / `反向：…`，见 `[[../../references/test-case-writing-rules.md]]`
5. **备注**：`{filename} > it("{title}")`

## 菜单样本（8 条）

| 源文件 | 条数 |
|--------|------|
| menu-system-only.test.ts | 3 |
| menu-project-scope.test.ts | 3 |
| menu-repo-cache.test.ts | 2 |

## 输出

追加到当前模块 `cases.json` 的 `cases` 数组（与 gateway 用例合并后统一生成 CSV）。
