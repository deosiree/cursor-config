# Few-shot：仅页面接入

## 场景

`createTenantNameRules` 已存在，租户表单未绑 blur/submit。

## 输入

```text
componentPath: src/views/tenant/components/TenantFormFields.vue
fields:
  - prop: tenantName, ruleStyle: pageWireOnly, hooks: [blurTrim, submitNormalize]
```

## 改动清单

1. import `createTenantNameRules`, `trimNameOnBlur`, `normName`, `NAME_MAX_LENGTH`
2. `rules.tenantName = createTenantNameRules()`
3. `@blur="() => trimNameOnBlur(innerModel, 'tenantName', formRef)"`
4. 父组件 submit：`normName(data.tenantName, NAME_MAX_LENGTH.tenantName)`

**不**新增 validator 逻辑。
