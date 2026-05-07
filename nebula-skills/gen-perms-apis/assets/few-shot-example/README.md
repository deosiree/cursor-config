# few-shot-example

这个目录放给 agent 的 few-shot 样例入口，分成两类：

1. 结构型样例
   - 展示最终单文档结构长什么样
   - 参考：`[[template/sample-run/apex_dev-route-component-perm-api.md]]`
2. 迭代型样例
   - 展示当契约不全时，如何输出待人工介入
   - 展示得到用户回答后，如何继续补完并保留挂起痕迹
   - 参考：`[[template/sample-run/apex_dev-route-component-perm-api-iteration.md]]`

使用边界：

- 如果用户当前只要最终结构，优先参考主结构样本
- 如果用户明确提到“条件可能不够”或“允许后续继续补”，优先参考闭环样本

重点不是背诵样本文本，而是学会：

- 先输出当前已确认部分
- 再提出待人工介入问题
- 用户回答后继续完善原文档
- 某些问题可以被人工判定为“暂不处理”，并保留挂起痕迹
