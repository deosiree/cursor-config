# 判断执行场景

## 输入 → flowScope

| 用户意图 | flowScope |
|----------|-----------|
| 登录、doctor、能不能跑 | `preflight` |
| 创建测试用户、种子用户、邮箱/密码直设 | `seed_users` |
| 删用户、保留 N 人、清理 oc0601/u0601 | `cleanup` |
| 为什么只有编辑、perm 不对、操作列 | `perm_diagnose` |
| 全流程 E2E | `full` |

## 分支

- 仅问源码 perm 绑定 → **不触发 OpenCLI**，读 UserTable + YAML
- 无 OpenCLI → 停，提示 `opencli doctor`
- 要改 `checkHasPerm` 逻辑 → apex_dev 代码任务，与本 skill 并行

## 默认账号

`local-user0601`（`user0601v2@qq.com`）除非用户指定 admin。
