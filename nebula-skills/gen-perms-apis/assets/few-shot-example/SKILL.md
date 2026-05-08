---
name: 梳理权限点与apis few-shot
description: 当主 skill 需要样例来提醒最终结构、多轮补全或 API 反查回归时使用。
---

# few-shot 使用说明

## 先分辨你需要哪种样例

1. 结构型 few-shot
   - 看 `[[template/sample-run/apex_dev-route-component-perm-api.md]]`
   - 用于学习最终文档结构、属性头、路由/组件/权限点分区

2. 迭代型 few-shot
   - 看 `[[template/sample-run/apex_dev-route-component-perm-api-iteration.md]]`
   - 用于学习契约不全时如何先输出待人工介入，再根据用户回答继续补完

3. API 反查型 few-shot
   - 先看迭代索引 `[[api-backtrace-regression.md]]`
   - 再按问题读取分轮记录：`[[api-backtrace-regression/01-baseline-failures.md]]`、`[[api-backtrace-regression/02-gateway-contract-corrections.md]]`、`[[api-backtrace-regression/03-focus-and-backend-todo.md]]`、`[[api-backtrace-regression/04-emit-lift-and-profile-security.md]]`
   - 完整样例看 `[[template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]`
   - 用于学习漏看 gateway、漏看子组件 emit/prop/v-model 抬升、未解析 base URL、补充 devmgr/dbres 契约、关注路由收敛结论的处理方式

## 优先级判断

- 用户只要最终结构：优先参考结构型 few-shot
- 用户明确说“条件可能不够”“后面还会继续补”：优先参考迭代型 few-shot
- 用户指出“当前无后端 API 调用是错的”“还要看 gateway”“变量没解析出来”“子组件抬升给父组件”：优先参考 API 反查型 few-shot

## 规则

- 遇到契约缺失时，不是失败退出
- 先输出当前已确认部分
- 再输出待人工介入
- 用户回答后继续完善原文档，而不是另起一份无关文档
- 若用户明确说明“后端未实现、暂不处理”，可以保留挂起痕迹而不继续追问
- 查 API 时必须追完 `业务层 -> gateway -> api -> 契约`、`业务层 -> api -> 契约`、`子组件 emit/prop/v-model -> 父组件/组合式函数 -> gateway/api -> 契约`
- 未解析变量、gateway 方法名、映射函数名、错误中间路径不能写成正式 API URL
- `关注模块` 与 `关注路由` 为空时默认全量；只有用户显式提供关注范围时，才弱化非关注路由
- API 反查 few-shot 是多轮迭代记录，不是最终产物模板
