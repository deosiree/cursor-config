# API 反查回归 few-shot 索引

这个入口不是最终输出文档，而是本次会话多轮迭代的回归记录索引。使用它时，应按轮次理解“用户指出了什么失败 -> agent 应该怎么修正 -> 哪条规则需要沉淀”，而不是直接照抄为最终结果。

## 迭代记录

1. `[[api-backtrace-regression/01-baseline-failures.md]]`
   - 记录初版失败：停在 gateway、未解析 base URL、把子组件误判为无 API。

2. `[[api-backtrace-regression/02-gateway-contract-corrections.md]]`
   - 记录 gateway 到 api 到契约的修正：设备激活、设备绑定列表、补充 devmgr/dbres 契约。

3. `[[api-backtrace-regression/03-focus-and-backend-todo.md]]`
   - 记录用户指定关注路由后的处理：非关注路由弱化、后端待开发接口暂不设计权限点与 API。

4. `[[api-backtrace-regression/04-emit-lift-and-profile-security.md]]`
   - 记录子组件事件抬升后的二次补强：安全配置、个人中心修改密码/资料/邮箱/手机号。

## 使用方式

- 如果用户指出“不是无后端 API”，先看第 1 轮和第 4 轮。
- 如果用户指出“漏看 gateway”或“变量没解析出来”，先看第 2 轮。
- 如果用户提供关注路由或说明“后端待开发，先不设计”，先看第 3 轮。
- 输出最终文档时仍应参考 `[[../../template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]` 的人类可读样例。

## 固化后的结论

- API 反查不能停在业务层、gateway、子组件事件、映射函数或未解析常量。
- `关注模块` 与 `关注路由` 只是结论收敛参数；为空时默认全量。
- 后端待开发且用户明确暂不设计时，保留链路说明但不强行生成权限点与 API。
