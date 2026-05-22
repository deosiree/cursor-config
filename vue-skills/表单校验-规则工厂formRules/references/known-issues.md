# 已知问题（实施时顺带修复）

## normName 清洗链

部分实现中第二行误写为 `cleaned = value.replace(...)`，导致后续清洗未作用于 `trimmed`。应全程对 `cleaned` 链式赋值。

## 名称单测与文案

若项目用 `i18nKey` 策略，单测断言 `error.message` 可能是翻译后文案或 key，需与 [`project-discovery.md`](project-discovery.md) 探测结果一致。

## ESLint 与正则

字符类 `[*+]` 内勿写 `\*` `\+`（`no-useless-escape`）。动态段正则为：

```ts
/^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$/
```
