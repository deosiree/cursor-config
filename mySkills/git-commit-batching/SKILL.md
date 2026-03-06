---
name: git-commit-batching
description: Use when a branch has many unpushed changes and needs functional batching plus repository-style commit naming before push.
---

# 目标
把“多天未推送”的混合改动拆成可回滚、可评审的多批次 commit，并输出符合仓库风格的 commit 名称。

## 适用场景
1. `git status` 同时出现 `A/M/MM/??`，且改动跨 API、store、views、utils。
2. 已暂存与未暂存混在一起，无法直接一次性安全提交。
3. 需要按功能拆分历史，降低回滚与联调风险。

## 仓库命名规范
1. 结构：`<type>(<scope>): :<emoji>: <summary>`
2. `type` 推荐：`feat` `fix` `refactor` `chore` `docs` `test`
3. `scope` 推荐：`api` `permission` `views` `utils` `config`
4. `summary` 使用中文短句，描述“业务动作+对象”

## 标准执行流程
1. 先清理暂存区，避免 MM 文件导致批次污染：`git restore --staged .`
2. 采集改动清单：`git status --short` + `git diff --name-only` + `git diff --cached --name-only`
3. 按“功能边界”分批：配置、API/mock、权限链路、页面适配、页面修复。
4. 每批只 `git add` 该批路径，执行 `git commit -m "..."`
5. 每个 commit 后复核：`git show --name-only --oneline -n 1`

## 本项目参考批次（apex_dev / seccenter_v2）
1. 配置与工程规范
`chore(config): :wrench: 补充 seccenter v2 环境配置与格式化规则`
2. API 与 mock 接入
`feat(api): :sparkles: 新增 seccenter v2 API 与 mock 数据`
3. 权限链路重构
`feat(permission): :sparkles: 重构权限鉴权链路并接入 v2 权限数据`
4. 菜单与租户页面适配
`refactor(views): :recycle: 适配菜单与租户页面到 seccenter v2`
5. 登录/用户/角色页面修复
`fix(views): :bug: 修复登录注册与用户角色页面联动问题`
