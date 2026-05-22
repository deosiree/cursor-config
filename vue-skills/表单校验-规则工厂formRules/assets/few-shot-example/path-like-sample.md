# Few-shot：路径类规则

## 场景

菜单路由 path：maxlength 64，允许 `/user?` 拼参，拒绝段中冒号。

## 输入

```text
componentPath: src/views/system/menu/components/MenuFormDialog.vue
fields:
  - prop: routePath, ruleStyle: pathLike, ui.maxlength: 64, allowParamSuffix: true, extra: uniqueCheck
```

## 实施对照

1. 合并 [`formRules.routePath.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.fragment.ts) 到 `rulesModule`
2. 页面接入 [`MenuFormDialog.wire.fragment.vue`](../../template/sample-nebula/after/MenuFormDialog.wire.fragment.vue)
3. 单测 [`formRules.routePath.test.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.test.fragment.ts)

## 测试矩阵（单测断言 message）

| 输入 | 期望 |
|------|------|
| `/system/menu` | 通过 |
| `/user?` `/user#` `/list?from=menu` | 通过 |
| `/user/:id` | 通过 |
| `/user:id#` `/user:#` `/?xxx` | 段中不要用冒号 / 段首不要片段符 |
| `/:id#` | 动态段不要接#? |

## 页面组合唯一性

```ts
routePath: [
  ...createRoutePathRules(),
  {
    async validator(_r, value, cb) {
      try {
        await ensureRoutePathUnique(value, formData.id);
        cb();
      } catch (e) {
        cb(e as Error);
      }
    },
    trigger: ["blur", "change"],
  },
],
```

唯一性文案由页面或业务层提供，**不在** pathLike 工厂内硬编码。
