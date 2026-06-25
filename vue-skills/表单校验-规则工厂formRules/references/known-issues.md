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

**现象**：弹窗一打开，空表单或刚回填的表单出现红框。

**原因**（二选一，不要叠加修复）：

1. **rules 引用变化**：`rules` 为 `computed`、`pwdPair`、异步 `policy` 注入等，导致 Element Plus 在 `validate-on-rule-change: true`（默认）下重跑全表校验。
2. **校验态残留**：`destroyOnClose: false` 或上次点「确定」校验失败后，关闭再开仍保留红框。

**决策树（每个文件只选一种最小修复）**：

| 症状 | 最小修复 |
|------|----------|
| `rules` computed / pwdPair / 异步 policy，且 `el-form` 无 `validate-on-rule-change` | `el-form` 加 `:validate-on-rule-change="false"` |
| 已有 `validate-on-rule-change="false"`（或 `rules` 为 stable `reactive`），打开仍红 / 残留红框 | 打开弹窗后 `nextTick(() => formRef?.clearValidate())` |

**示例**（apex_dev 用户管理，对齐同文件 `handleOpenResetDialog`）：

```ts
// handleOpenDialog 末尾
nextTick(() => {
  userFormRef.value?.clearValidate();
});
```

子组件 `UserFormFields` 已有 `:validate-on-rule-change="false"` 时，父级只需补 `clearValidate`，勿再叠第二层。

关闭弹窗：`resetFields` + `clearValidate`（若已有则保留）。提交仍 `formRef.validate()`。

详见 [`password-pair-model.md`](password-pair-model.md)。

## 密码对重复 rules

子组件已 `spread pwdPair` 时，父级 `rules` 勿再写 `password`/`confirmPassword`。勿 export/import `DEFAULT_PWD_POLICY` / `DEF_PWD_PLCY` 作页面初值。

## pathLike 路径常量

使用 `PATH_MAX_LENGTH.routePath` / `.apiPath`，勿新增 `ROUTE_PATH_MAX_LENGTH` 与 `API_PATH_MAX_LENGTH` 双 export。
