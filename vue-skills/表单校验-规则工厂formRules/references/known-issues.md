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

## 动态 rules 打开弹窗全红

**现象**：改密/重置密码弹窗一打开，空表单三字段全红。

**原因**：`rules` 为 `computed`，`getPwdPolicy()` 返回后 `rules` 引用变化；Element Plus 默认 `validate-on-rule-change: true` 触发全表校验。

**修复**：

```vue
<el-form :validate-on-rule-change="false" ... />
```

打开弹窗时 `nextTick(() => formRef?.clearValidate())`；关闭时 `pwdPlcy = undefined`。提交仍 `formRef.validate()`。

详见 [`password-pair-model.md`](password-pair-model.md)。

## 密码对重复 rules

子组件已 `spread pwdPair` 时，父级 `rules` 勿再写 `password`/`confirmPassword`。勿 export/import `DEFAULT_PWD_POLICY` / `DEF_PWD_PLCY` 作页面初值。

## pathLike 路径常量

使用 `PATH_MAX_LENGTH.routePath` / `.apiPath`，勿新增 `ROUTE_PATH_MAX_LENGTH` 与 `API_PATH_MAX_LENGTH` 双 export。
