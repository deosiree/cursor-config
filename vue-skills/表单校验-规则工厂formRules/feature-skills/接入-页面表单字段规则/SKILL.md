---
name: 接入-页面表单字段规则
description: 在已解析的表单组件上绑定 rules、blur trim、submit 规范化；不新增校验语义。
---

# 接入-页面表单字段规则

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=pageWireOnly`。

## 何时使用

- `createXxxRules` / `validateXxxSyntax` **已存在**
- 仅需改目标 `componentPath` 的模板与 script

## 何时不要使用

- 需新增 validator 语义 → 先走对应「配置-/新增-」子 skill
- 需补翻译词条 → 不在本 skill 范围

## 前置

- 已完成 [`project-discovery.md`](../../references/project-discovery.md)
- 已知 `rulesModule` import 路径（如 `@/utils/formRules`）

## GREEN

### 1. import

```ts
import {
  createMenuNameRules,
  createRoutePathRules,
  normName,
  trimNameOnBlur,
  trimRoutePathOnBlur,
  NAME_MAX_LENGTH,
} from "@/utils/formRules"; // 以探测结果为准
```

### 2. rules 对象

```ts
const formRules = reactive({
  name: createMenuNameRules(),
  routePath: [...createRoutePathRules(), /* 业务 validator */],
});
```

`:rules="formRules"` 或 computed 返回；`validate-on-rule-change` 按项目惯例。

### 3. 模板

| hook | 绑定 |
|------|------|
| blurTrim 名称 | `@blur="() => trimNameOnBlur(model, prop, formRef)"` |
| blurTrim 路径 | `@blur="() => trimRoutePathOnBlur(model, prop, formRef)"` |
| UI 上限 | `maxlength` 与 `NAME_MAX_LENGTH` / `ROUTE_PATH_MAX_LENGTH` 区分时按用户确认 |

### 4. submit

```ts
payload.name = normName(formData.name, NAME_MAX_LENGTH.menuName);
payload.routePath = String(formData.routePath ?? "").trim();
```

### 5. 对照表（交付时填写）

| prop | factory | blur | submit |
|------|---------|------|--------|
| name | createMenuNameRules | trimNameOnBlur | normName |
| routePath | createRoutePathRules + unique | trimRoutePathOnBlur | trim |

## 参考

- **双字段接入样板**：[`MenuFormDialog.wire.fragment.vue`](../../template/sample-nebula/after/MenuFormDialog.wire.fragment.vue)
- [`page-wire-sample.md`](../../assets/few-shot-example/page-wire-sample.md)

## 验收

- [ ] 失焦与提交行为与规则模块一致
- [ ] 未新增 locale 改动
