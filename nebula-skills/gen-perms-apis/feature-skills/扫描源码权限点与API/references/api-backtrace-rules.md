# API 反查规则（本地引用）

> 完整规则见父级 `[[../../../references/api-backtrace-rules.md]]`。
> 本文件是本地薄包装，供本 skill 独立运行时引用。

## 三类硬链路（摘要）

1. `业务层 → gateway → api → 契约`
2. `业务层 → api → 契约`
3. `子组件 emit/prop/v-model → 父组件/组合式函数 → gateway/api → 契约`

## 禁止停止点

- 不能停在 gateway 方法名
- 不能停在 `/${BASE_URL}/xxx` 未解析变量
- 不能因"子组件只 emit"就判为无 API
- 不能因"业务层没 import src/api"就停止

## 契约匹配

`默认契约 → 补充契约 → 待人工介入`
