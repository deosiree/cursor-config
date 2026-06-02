---
name: 角色 Tab 校验跳转自动化
description: 基于 OpenCLI 验证角色新增弹窗的 Tab 切换校验行为 — TC1~TC4（空名切 Tab 拦截、正常提交、取消后重置 Tab）。当需要验证 useTabValidation、角色弹窗 Tab 跳转、表单校验拦截时使用。
tags:
  - 浏览器自动化
  - OpenCLI
  - 角色管理
  - Tab校验
  - 表单断言
should-trigger:
  - prompt 含 角色管理 + Tab 校验 / 弹窗 / 表单错误
  - prompt 含 role-tab-validation / useTabValidation
  - prompt 含 弹窗 Tab 切换 + 断言 + OpenCLI
should-not-trigger:
  - 只改角色管理业务代码（不用浏览器验证）
  - 租户/用户/菜单场景（分别走 opencli-ux-tenant / user-perm / menu）
  - 不涉及 Tab 校验角色表单
---

# 角色 Tab 校验跳转自动化

> 验证 [`useTabValidation`](../../../apex_dev/src/composables/useTabValidation.ts) 在角色新增弹窗中的 Tab 跳转行为。

## 快速启动

```bash
cd opencli-ux-role-tab-validation

# 全流程（登录 + TC1~TC4）
bash run-e2e.sh --profile local

# 已登录，只跑用例
bash role-tab-validation.sh --profile local --skip-login
```

## 输入契约

| 字段 | 说明 |
|------|------|
| `targetProfile` | `local` / `cloud`（见 `config/ux-test.config.json`） |
| `browserSession` | OpenCLI 会话名，默认 `nebula-ux` |
| `skipLogin` | 是否已登录 |

密码仍为 `CHANGE_ME` 时需先配置 `config/ux-test.config.local.json`。

## RED — 失败基线

1. **典型需求**：「测一下角色弹窗的 Tab 校验」「验证 Tab 跳转」
2. **易漏点**：
   - `click --name "确定"` 在 Element Plus 弹窗中可能点击到底层遮罩 → 需 `dialog-footer` 兜底
   - 弹窗 `append-to-body` 后，`state` 显示 dialog 为空壳 → 需 eval 读 `.el-overlay` 可见层
   - Vue `fill` 不触发 input 事件 → 需 native InputValueSetter 兜底
3. **误触发**：只改 `useTabValidation.ts` 源码逻辑（用单元测试即可）

## GREEN — 测试用例

| 用例 | 步骤 | 期望 |
|------|------|------|
| TC1 | 新增 → 不填名 → 切「关联设备」→ 确定 | 跳回「基础信息」，显示错误 |
| TC2 | 新增 → 不填名 → 切「菜单权限」→ 确定 | 同上 |
| TC3 | 新增 → 填合法名 → 确定 | 弹窗关闭或 toast「新增成功」 |
| TC4 | 新增 → 切「关联设备」→ 取消 → 再新增 | 默认 Tab 为「基础信息」 |

### 路由

| 意图 | 动作 |
|------|------|
| 全流程 TC1~TC4 | `bash run-e2e.sh --profile local` |
| 仅登录 | `bash login.sh --profile local` |
| 跳过登录只跑用例 | `bash role-tab-validation.sh --profile local --skip-login` |

### 核心函数（lib/common.sh）

| 函数 | 用途 |
|------|------|
| `open_role_create_dialog` | eval 点击「新增」 |
| `click_role_dialog_tab` | 切换弹窗 Tab（click → eval 兜底） |
| `click_dialog_confirm` / `click_dialog_cancel` | 确定 / 取消 |
| `assert_role_dialog_tab` | 断言当前 Tab 名称 |
| `assert_role_form_error` | 断言表单错误文本 |
| `assert_role_dialog_closed` | 断言弹窗已关闭 |
| `wait_leave_login` | 等待登录完成 |
| `fill_role_name` | 填写角色名称（fill → eval 兜底） |
| `get_role_dialog_state` | 读弹窗状态（activeTab + errorText + 可见性） |

## 输出契约

- `tcResults[]` — 每条用例通过/失败
- `failures[]` — 失败用例 + 错误详情 + `screenshots/fail-{case}.png`
- `roleDialogState` — 最后一次弹窗状态快照

## 执行前确认

- [ ] `opencli doctor` 通过
- [ ] 目标环境（http://localhost:8080 / 8081）可达
- [ ] 密码已配置（非 CHANGE_ME）
- [ ] 测试角色名前缀不与已有数据冲突

## 关联资产

- 入口脚本：`login.sh` / `run-e2e.sh`
- 核心用例：`role-tab-validation.sh`
- 配置：`config/ux-test.config.json`
- 源码落点：[`useTabValidation.ts`](../../../apex_dev/src/composables/useTabValidation.ts)
- 主路由：[`自生长的 OpenCLI 自动化知识体系/SKILL.md`](../SKILL.md) → 路由到本 skill