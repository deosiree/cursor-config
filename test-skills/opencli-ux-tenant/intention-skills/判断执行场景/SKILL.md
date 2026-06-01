---
name: 判断执行场景
description: 分析用户需求，判断当前应使用哪个 profile、执行全流程还是部分流程、是否需要先自检。
---

# 核心任务

根据用户提供的目标环境和需求范围，决策执行方案。

## 何时触发

- 用户说"跑一下租户测试"或类似意图
- 从 SKILL.md 的 `preflight` / `full_flow` / `delete_only` 路由进入

## 输入 / 前置条件

- `targetProfile`（可选，默认从 `UX_PROFILE` 或 config 的 `defaultProfile` 读取）
- `targetTenant`（可选，默认 config 中的 `tenantData.tenantName`）
- `flowScope`（可选：`full` / `delete-only`，默认 `full`）
- `skipLogin`（可选：`true` / `false`，默认 `false`）

## 输出

- `selectedProfile` — 最终选定的 profile 名
- `selectedFlow` — `full_flow` / `delete_only` / `preflight`
- `tenantName` — 要操作的租户名
- `skipLogin` — 是否跳过登录
- `passwordConfigured` — 密码是否已配置（非 CHANGE_ME）
- `captchaMode` — 验证码模式（auto / manual / bind-only）

## 下一步路由

- `selectedFlow=full_flow` → `[[../../feature-skills/执行全流程/SKILL.md]]`
- `selectedFlow=delete_only` → `[[../../feature-skills/执行搜索删除/SKILL.md]]`
- 密码未配置 → 停，提示用户配置 `config/ux-test.config.local.json`
- `captchaMode=bind-only` 且 `skipLogin=false` → 提示用户先手动登录后加 `--skip-login`

## 边界

- 只负责判断"跑什么、怎么跑"，不负责实际执行
- 不分析失败日志（交给 `诊断失败原因`）
