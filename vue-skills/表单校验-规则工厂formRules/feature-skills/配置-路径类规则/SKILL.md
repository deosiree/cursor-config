---
name: 配置-路径类规则
description: 配置 pathLike 风格：分段 path 校验、拼参后缀、Vue 动态段、createXxxPathRules。
---

# 配置-路径类规则

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=pathLike`。

## 何时使用

- 路由 path、redirect path 等以 `/` 分段的路径字段
- 需允许 `/user?`、`/user#` 作为拼参模板
- 需拒绝 `user:id#`、`/?xxx` 等畸形 path

## 模型

见 [`route-path-segment-model.md`](../../references/route-path-segment-model.md)。

## GREEN

### 1. rules 模块

1. `export const ROUTE_PATH_MAX_LENGTH = 64`（与 UI maxlength 对齐）
2. `validateRoutePathSyntax(raw: string): void` — 失败 `throw new Error(t(key))` 或直出文案
3. `createRoutePathValidator()` / `createRoutePathRules()`
4. `trimRoutePathOnBlur(model, field, formRef?)`

段内动态失败分具体 key：`段中不要用冒号`、`动态段不要接#?` 等（见 model 表）。

### 2. 页面

```vue
<el-input
  v-model="formData.routePath"
  maxlength="64"
  @blur="() => trimRoutePathOnBlur(formData, 'routePath', formRef)"
/>
```

```ts
routePath: [
  ...createRoutePathRules(),
  { validator: async (_, value, cb) => { /* 唯一性等业务 */ }, trigger: ['blur','change'] },
],
```

业务唯一性 **不**写入本风格工厂，仅在页面组合 validator。

### 3. 约束确认

- `allowParamSuffix: true` → 启用拼参后缀段正则
- 错误文案 ≤12 汉字

### 4. 测试

矩阵见 few-shot：合法 `/user?`、`/list?from=menu`、`/user/:id`；非法 `/user:id#`、`/?xxx`。

断言 `error.message` 为稳定 key 或直出文案。

## 参考

- **完整实现（优先拷贝对照）**：[`formRules.routePath.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.fragment.ts)
- **单测矩阵**：[`formRules.routePath.test.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.test.fragment.ts)
- 流程 few-shot：[`path-like-sample.md`](../../assets/few-shot-example/path-like-sample.md)

## 验收

- [ ] 单测覆盖拼参与动态段边界
- [ ] eslint 无 useless-escape
- [ ] 未改 locale
