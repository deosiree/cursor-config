---
name: 配置-路径类规则
description: 配置 pathLike 风格：分段 path 校验、拼参后缀、Vue 动态段、createRoutePathRules / createApiPathRules。
---

# 配置-路径类规则

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=pathLike`。

messageKey：[`message-key-constraints.md`](../../references/message-key-constraints.md)。模块结构：[`formRules-module-map.md`](../../references/formRules-module-map.md)。

## 何时使用

- 路由 path、redirect path、API `apiUrl` 等以 `/` 分段的路径字段
- 需允许 `/user?`、`/user#` 作为拼参模板
- 需拒绝 `user:id#`、`/?xxx` 等畸形 path

## 模型

见 [`route-path-segment-model.md`](../../references/route-path-segment-model.md)。

## GREEN

### 1. rules 模块

1. 常量：`ROUTE_PATH_MAX_LENGTH`、`API_PATH_MAX_LENGTH`（与 UI `maxlength` 对齐）
2. **禁止** export `validateRoutePathSyntax` / `validateApiPathSyntax`；二者模块内私有，由 `createRoutePathRules` / `createApiPathRules` 对外
3. 在 `// --- 路径校验原子 ---` 增改 `chkPath*` / `chkSeg*`；**禁止**在 skill 或页面手写整段 for 循环，按 map 在聚合内编排
4. route 与 apiUrl **共用**原子；差异：`chkSegRouteColon` vs `chkSegApiColon`；route 多一次 `chkSegLead({ onlyDigitUnderscoreLead: true })`
5. 导出 `createRoutePathRules()`、`createApiPathRules()`、`trimFieldOnBlur`
6. 超长：`fail("{label}超过{maxLength}字")` + `createRuleFail({ label, maxLength })`；禁止「路径超过64个字符」类裸 key

### 2. 页面

```vue
<el-input
  v-model="formData.routePath"
  :maxlength="ROUTE_PATH_MAX_LENGTH"
  @blur="() => trimFieldOnBlur(formData, 'routePath', formRef)"
/>
```

```ts
routePath: [
  ...createRoutePathRules(),
  { validator: async (_, value, cb) => { /* 唯一性等业务 */ }, trigger: ['blur','change'] },
],
apiUrl: createApiPathRules(),
```

业务唯一性 **不**写入本风格工厂，仅在页面组合 validator。

### 3. 约束确认

- `allowParamSuffix: true` → 启用拼参后缀段正则
- 新建 messageKey 遵守 message-key-constraints

### 4. 测试

```ts
const validator = createRoutePathRules()[0].validator!;
// 或 createApiPathRules()[0].validator!
```

矩阵：合法 `/user?`、`/list?from=menu`、`/user/:id`；非法 `/user:id#`、`/?xxx`。断言稳定 `error.message`；pathLike 保留 `expectMessageWithinDisplayLimit`。

## 参考

- **编排示意（非完整实现）**：[`formRules.routePath.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.fragment.ts)
- **单测 runner**：[`formRules.routePath.test.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.test.fragment.ts)
- 流程 few-shot：[`path-like-sample.md`](../../assets/few-shot-example/path-like-sample.md)

## 验收

- [ ] 单测经 `create*PathRules()[0].validator`，未 export `validate*`
- [ ] 单测覆盖拼参与动态段边界
- [ ] 未改 locale
