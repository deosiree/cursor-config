---
name: 用户管理UX与权限自动化
description: 当需要用 OpenCLI 对 nebula 用户管理页做 E2E（登录、种子用户创建/清理、操作列权限诊断、checkHasPerm 显示兜底验证）时使用。触发词：用户管理自动化、OpenCLI user0601、操作列权限、种子用户、批量删用户、sys:user:add。
---

# 目标

基于 **OpenCLI browser** 在 microfb + apex_dev 子应用上，自动化完成用户管理相关验证与数据准备：**登录 → 权限预检 → 创建种子用户 → 对比本人/他人操作列 → 批量清理**。

## 何时使用

- 需要验证 `checkHasPerm` / `OpItem` / `v-hasPerm` 与用户列表操作列表现
- 需要为 menuTest 租户准备「邮箱激活 + 密码直设」种子用户
- 自动化创建用户过多，需要批量删到指定数量
- 排查「只有编辑、没有更多」是权限、本人行守卫还是 OperationColumn 折叠

## 何时不要使用

- 纯单元测试（用 `apex_dev/src/directive/__tests__/` 即可）
- 没有 OpenCLI / Chrome 桥接（先 `opencli doctor`）
- 只需要改业务代码，不需要 E2E 或数据准备

## 输入契约

| 字段 | 说明 |
|------|------|
| `targetProfile` | `local-user0601` / `local-admin`（见 `config/ux-test.config.json`） |
| `browserSession` | OpenCLI 会话名，默认 `user0601` |
| `flowScope` | `preflight` / `seed_users` / `cleanup` / `perm_diagnose` / `full` |
| `keepCount` | 清理时保留用户数，默认 `10` |
| `emailCount` / `pwdCount` | 种子用户数量，默认各 `3` |

缺失 `targetProfile` 或密码仍为 `CHANGE_ME` 时先停下确认。

## RED — 失败基线（本会话沉淀）

1. **典型需求**：「用 user0601 创建几个用户对比操作列」「为什么只有编辑」
2. **易漏点**：
   - 无 `sys:user:add` → 无「新增」按钮
   - 列表仅本人一行 + `!isCurrentUser` → 只有「编辑」
   - API 路径误用 `/dev-api/seccenter/v2`（应 `forward` / `direct`）
   - Vue 登录需 `InputEvent`，纯 `type` 无效
   - 脚本 `location.href` 跳转导致 OpenCLI CDP 断开
3. **误触发**：只问 perm 绑定是否写错（源码对照即可，不必 OpenCLI）

## GREEN — 任务路由

| flowScope | 路由 |
|-----------|------|
| `preflight` | `[[intention-skills/判断执行场景/SKILL.md]]` → `[[feature-skills/登录与预检/SKILL.md]]` |
| `seed_users` | 登录 → `[[feature-skills/创建种子用户/SKILL.md]]` |
| `cleanup` | 登录 → `[[feature-skills/批量清理用户/SKILL.md]]` |
| `perm_diagnose` | 登录 → `[[feature-skills/操作列权限诊断/SKILL.md]]` + 单元测试 |
| `full` | preflight → seed_users → perm_diagnose（可选 cleanup） |

## 执行前确认（必过）

- [ ] `opencli doctor` 通过
- [ ] 目标账号密码已在 `config/ux-test.config.local.json` 配置
- [ ] 创建/删除前确认租户与账号（避免误删生产）
- [ ] 批量清理：确认 `keepCount` 与保留规则（本人 + owner + 最新 N）

## 人工门禁

- 密码为 `CHANGE_ME`
- 用户未确认批量删除
- 要求 UI 走通但 OpenCLI 会话无「新增」且未 `bind` 用户已登录标签页
- 同时要求改 `UserTable.vue` 业务守卫与跑 E2E（拆任务）

## 输出契约

- `sessionUser` / `userPerms`（`sys:user:*` 子集）
- `createdUsers[]` 或 `cleanupSummary`
- `opColumnCompare`（本人行 vs 他人行：inline / hasMore）
- `failures[]` + 对照 `references/common-failures.md`

## 使用示例

### Shell 封装（推荐）

```bash
# 全流程
bash run-e2e.sh --profile local

# 仅创建种子用户
bash run-e2e.sh --profile local --flow seed_users

# 操作列诊断
bash run-e2e.sh --profile local --flow perm_diagnose

# 批量清理到 10 人
bash run-e2e.sh --profile local --flow cleanup --keep 10

# 自检
bash run-e2e.sh --check
```

### OpenCLI 直接 eval（不依赖 shell）

```text
用 user0601 创建 3 邮箱 + 3 密码直设种子用户
→ seed_users → 读 scripts/create-seed-users.js 并 opencli browser eval

列表用户太多，删到只剩 10 个
→ cleanup → 读 scripts/cleanup-users-to-n.js 并 eval

为什么操作列只有编辑
→ perm_diagnose → scripts/diagnose-op-column.js 或 references/permission-op-column-pitfalls.md
```

## 关联资产

- 入口脚本：`login.sh` / `run-e2e.sh` + `lib/`
- 可执行脚本：`scripts/create-seed-users.js`、`scripts/cleanup-users-to-n.js`、`scripts/diagnose-op-column.js`、`scripts/create-users-via-ui.js`
- 配置：`config/ux-test.config.json` + `config/ux-test.config.local.json`
- 单测：`apex_dev/src/directive/__tests__/hasPerm.test.ts`、`userTableOpPermDiagnostic.test.ts`
- Darwin：`evals/darwin-baseline-report.md`、`evals/darwin-round1-report.md`
