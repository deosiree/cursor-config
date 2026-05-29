---
name: gateway-基于test.ts生成
description: 将 src/gateway/**/__tests__/** 的 Vitest 用例撰写为 cases.json 行（偏 F12 Network、表单回显、权限面板）。
---

# gateway 层：基于 test.ts 生成用例

## 适用路径

- `src/gateway/__tests__/**/*.test.ts`
- `src/gateway/**/menu-tree-helpers` 等 helper 测试（与 gateway 同目录习惯）

## 撰写规则

1. **名称**：映射/交互一句话概括
2. **步骤**：进入菜单管理 → 操作 → F12 Network / 表单
3. **预期**：红绿格式；`develop结果` 由 config 默认 0，不写进步骤
4. **备注**：100% 溯源 `it` 英文名
5. **复合 it**：每个独立 `expect` 场景拆一行（如 route normalization 11 条）

## 菜单样本（28 条）

| 源文件 | 条数 |
|--------|------|
| menu.gateway.test.ts | 14 |
| menu-tree-helpers.test.ts | 3 |
| menu-route-normalization.test.ts | 11 |

## 注意

- 祖先锁等概念用 UI 表述（灰禁、提示来源），避免 `hideLock` 等代码字段名
- 路由规范化用例可能需联调 microfb 侧栏，步骤中注明
