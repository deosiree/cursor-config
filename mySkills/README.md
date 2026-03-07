# mySkills 导航

## 使用顺序
1. 先使用父级路由 skill 选择具体 skill。
2. 再调用被推荐的具体 skill 执行任务。

## 父级路由 skills
1. `route-code-quality-skills`
   - 面向：代码质量与故障排查
   - 子技能：`data-flow-check` `dom-utils-check` `file-check` `prod-risk-check` `todolist` `gen-debugskills` `codex-session-watchdog`
2. `route-knowledge-content-skills`
   - 面向：总结复盘与内容加工
   - 子技能：`conversation-summary` `post-mortem` `tech-doc-to-podcast`
3. `route-language-localization-skills`
   - 面向：翻译与本地化
   - 子技能：`trans-doc` `translate`

## 直接调用示例
1. `使用 $route-code-quality-skills 先判断我这个前端异常该用哪个 skill。`
2. `使用 $route-language-localization-skills 根据输入文件类型推荐翻译 skill。`
3. `使用 $codex-session-watchdog 监控会话，长时间无响应或资源异常时系统通知提醒中断。`

## 项目专有 skills
1. 与 `nebula` 业务耦合的架构与路由技能已迁移到 `.cursor/nebula-skills`。
2. 包括：`route-architecture-delivery-skills`、`mf-route-home-alignment`。
3. 新增：`git-commit-batching`
   - 面向：多天未推送改动的分功能分批提交与命名规范输出
   - 文件：`.cursor/mySkills/git-commit-batching/SKILL.md`
4. 新增：`commit-review-unblock`
   - 面向：提交被 pre-commit/lint-staged 阻塞，同时需要做结构化代码审查
   - 文件：`.cursor/mySkills/commit-review-unblock/SKILL.md`

## 运维与守护 skills
1. `codex-session-watchdog`
   - 面向：Codex 对话执行监控（无响应超时、CPU/内存异常）
   - 脚本：`.cursor/mySkills/codex-session-watchdog/scripts/watchdog.ps1`

## 维护规则
1. 新增 skill 时，必须同步更新对应父级路由 skill 的 `references/decision-matrix.md`。
2. `display_name` 统一使用“动词+对象”格式。
3. 父级路由 skill 只负责“选 skill”，不替代子 skill 的详细执行逻辑。

## 全局规则：先检索最佳实践
1. 无论是否调用具体 skill，先做 web search 获取最新最佳实践。
2. 优先使用官方文档与维护者来源，避免仅依赖社区二手结论。
3. 在最终结论中附来源链接，并说明采用/不采用原因。
