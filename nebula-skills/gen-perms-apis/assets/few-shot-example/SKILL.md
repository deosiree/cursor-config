---
name: 梳理权限点与apis few-shot
description: 当主 skill 需要一个样例来提醒最终结构和多轮补全过程时使用。
---

先分辨你需要哪种样例：

1. 结构型 few-shot
   - 看 `[[template/sample-run/apex_dev-route-component-perm-api.md]]`
   - 用于学习最终文档结构、属性头、路由/组件/权限点分区

2. 迭代型 few-shot
   - 看 `[[template/sample-run/apex_dev-route-component-perm-api-iteration.md]]`
   - 用于学习契约不全时如何先输出待人工介入，再根据用户回答继续补完

优先级判断：

- 用户只要最终结构：优先参考结构型 few-shot
- 用户明确说“条件可能不够”“后面还会继续补”：优先参考迭代型 few-shot

规则：

- 遇到契约缺失时，不是失败退出
- 先输出当前已确认部分
- 再输出待人工介入
- 用户回答后继续完善原文档，而不是另起一份无关文档
- 若用户明确说明“后端未实现、暂不处理”，可以保留挂起痕迹而不继续追问
