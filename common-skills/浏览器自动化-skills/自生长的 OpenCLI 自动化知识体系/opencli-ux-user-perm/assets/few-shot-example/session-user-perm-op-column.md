# 会话 Few-Shot：用户权限 + OpenCLI（2026-06-01）

## 背景

menuTest 租户 `user0601v2@qq.com`，验证 `checkHasPerm` 合并 FUNCTION `isVisible` 显示兜底，并用 OpenCLI 准备种子用户对比操作列。

## 关键决策

1. **isOwner 跳过显示兜底**（用户明确要求，与一度误改相反）
2. **API 创建为主路径** — UI「新增」在 OpenCLI 会话不稳定
3. **「只有编辑」主因** — 非 perm 绑错，而是仅本人行 + `isCurrentUser` + inline=2

## 脚本成果

| 脚本 | 结果 |
|------|------|
| create-seed-users.js | 6 用户/create OK |
| create-users-via-ui.js | 常失败「未找到新增」 |
| cleanup-users-to-n.js | 73 → 10 人 |

## 代码落点

- `directive/permission/index.ts` — checkHasPerm + functionDisplayGuardCache
- `UserTable.vue` — OpItem perm 与 YAML 一致；TEMP 注释 isCurrentUser 待恢复
- `__tests__/hasPerm.test.ts` 等

## 引用本 few-shot 时

Agent 应优先打开 `SKILL.md` → 按 flowScope 路由，**不要**从 transcript 重新发明 API 路径。
