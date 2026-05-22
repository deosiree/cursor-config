# Few-shot：多语言标识符命名

messageKey：[`message-key-constraints.md`](../../references/message-key-constraints.md)。

## 场景

菜单名：侧栏展示 maxlength=8，入库校验上限 128。

## 输入

```text
componentPath: src/views/system/menu/components/MenuFormDialog.vue
fields:
  - prop: name, ruleStyle: nameIdentifier, fieldLabel: 菜单名, ui.maxlength: 8, validateMax: 128
```

## 实施顺序

1. **配置-多语言标识符命名规则**：仓库 `formRules.ts` + [`formRules.name.fragment.ts`](../../template/sample-nebula/after/formRules.name.fragment.ts) 要点
2. **接入-页面表单字段规则**：`trimFieldOnBlur` + `normName` 提交

## 片段

```vue
<el-input v-model="formData.name" maxlength="8"
  @blur="() => trimFieldOnBlur(formData, 'name', menuFormRef)" />
```

```ts
name: createMenuNameRules(),
// submit — 超长展示如 字段超过128字
payload.name = normName(formData.name, NAME_MAX_LENGTH.menuName);
```

## 权限名变体

`PermissionConfigDialog`：`createPermissionNameRules()`，可无 UI maxlength，validateMax 128。
