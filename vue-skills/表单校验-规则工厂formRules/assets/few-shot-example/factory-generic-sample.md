# Few-shot：通用规则工厂

## 场景

用户表单需要「邮箱必填 + 格式」。

## 输入

```text
componentPath: src/views/system/user/components/UserFormFields.vue
fields:
  - prop: email, ruleStyle: factoryGeneric, pattern: email, required: true
```

## 实施要点

1. 在 `rulesModule` 确认已有 `createEmailRequiredRules` 或组合 `requiredRule` + `patternRule(EMAIL_PATTERN, ...)`
2. 页面 `rules.email = createEmailRequiredRules()` 或展开 `asRuleArray(...)`
3. **不改** locale；消息沿用项目既有 key/文案

## 片段

```ts
export function createEmailRequiredRules() {
  return [
    ...asRuleArray(requiredRule("邮箱不能为空")),
    patternRule(EMAIL_PATTERN, "请输入正确的邮箱地址"),
  ];
}
```
