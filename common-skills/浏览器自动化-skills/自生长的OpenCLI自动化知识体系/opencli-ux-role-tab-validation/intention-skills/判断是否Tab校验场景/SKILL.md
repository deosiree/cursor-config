# 判断是否 Tab 校验场景

> 路由守卫节点。父级路由表可能把非 Tab 场景误发到本 skill，在此判断并 re-route。

## 判断规则

| 条件 | 判决 |
|:----|:------|
| 需求涉及「不填内容切 Tab」「Tab 跳转校验」「取消后回默认 Tab」 | ✅ **是本 skill 场景** → 按主 SKILL.md 路由 |
| 需求只说「测角色管理」但没提 Tab | ❌ 不是本 skill 场景 → 父级路由表可能误匹配 → **退回给父路由「以上都不是」** |
| 需求是「角色 CRUD / 创建 / 删除 / 列表」 | ❌ 没用 Tab 校验 → 退回父路由 |
| 需求是「角色权限 / 菜单权限 / 角色勾选」 | ❌ 角色权限树场景 → 走 `gen-perms-apis` 或双会话 E2E |
| 需求带 OpenCLI + 角色 + 弹窗 + 表单校验 | ✅ **可能是本 skill** → 确认是否涉及 Tab 切换，是则路由 |

## 输出

| 结果 | 动作 |
|:----|:------|
| `isTabValidation: true` | 按 `opencli-ux-role-tab-validation/SKILL.md` 执行 |
| `isTabValidation: false` | 退回父路由 `自生长的OpenCLI自动化知识体系/SKILL.md` → 「以上都不是」自生长 |
