# Darwin 接入模板

## 桥接期
优先检查：
- `./.cursor/darwin-skill`

若存在：
- 路由到外部 Darwin 套件

若不存在：
1. 请求人工提供
2. 再退化到内部简化闭环

## 内嵌期
稳定后可把 Darwin 套件整体并入当前 skill 的某个 feature 节点。
