# few-shot-example

这个目录放给 agent 的 few-shot 样例入口，分成三类：

1. 结构型样例
   - 展示最终单文档结构长什么样
   - 参考：`[[template/sample-run/apex_dev-route-component-perm-api.md]]`
2. 迭代型样例
   - 展示当契约不全时，如何输出待人工介入
   - 展示得到用户回答后，如何继续补完并保留挂起痕迹
   - 参考：`[[template/sample-run/apex_dev-route-component-perm-api-iteration.md]]`
3. API 反查型样例
   - 展示漏看 gateway、漏看子组件事件抬升、未补充契约导致的错误
   - 展示用户给定关注路由后，如何默认仍扫描全量但收敛结论范围
   - 迭代索引：`[[api-backtrace-regression.md]]`
   - 分轮记录：`[[api-backtrace-regression/01-baseline-failures.md]]`、`[[api-backtrace-regression/02-gateway-contract-corrections.md]]`、`[[api-backtrace-regression/03-focus-and-backend-todo.md]]`、`[[api-backtrace-regression/04-emit-lift-and-profile-security.md]]`
   - 完整样例：`[[template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]`

使用边界：

- 如果用户当前只要最终结构，优先参考主结构样本
- 如果用户明确提到“条件可能不够”或“允许后续继续补”，优先参考闭环样本
- 如果用户指出“不是无后端 API”“漏看 gateway”“子组件 emit 给父组件保存”“变量没解析出来”，优先参考 API 反查型样本

重点不是背诵样本文本，而是学会：

- 先输出当前已确认部分
- 再提出待人工介入问题
- 用户回答后继续完善原文档
- 某些问题可以被人工判定为“暂不处理”，并保留挂起痕迹
- API 反查必须追完 `业务层 -> gateway/api -> 契约`，不能停在未解析变量或子组件事件
- API 反查 few-shot 要按多轮反馈理解，不要把索引文件当最终结果文档
