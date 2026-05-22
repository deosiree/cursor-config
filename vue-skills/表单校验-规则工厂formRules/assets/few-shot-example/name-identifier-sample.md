# Few-shot：多语言标识符命名

## 场景

菜单名：侧栏展示 maxlength=8，入库校验上限 128。

## 输入

```text
componentPath: src/views/system/menu/components/MenuFormDialog.vue
fields:
  - prop: name, ruleStyle: nameIdentifier, fieldLabel: 菜单名, ui.maxlength: 8, validateMax: 128
```

## 实施顺序

1. **配置-多语言标识符命名规则**：对照 [`formRules.name.fragment.ts`](../../template/sample-nebula/after/formRules.name.fragment.ts)
2. **接入-页面表单字段规则**：`@blur` + `normName` 提交（见 wire 样板）

## 片段

```vue
<el-input v-model="formData.name" maxlength="8"
  @blur="() => trimNameOnBlur(formData, 'name', menuFormRef)" />
```

```ts
name: createMenuNameRules(),
// submit
payload.name = normName(formData.name, NAME_MAX_LENGTH.menuName);
```

## 权限名变体

`PermissionConfigDialog`：`createPermissionNameRules()`，可无 UI maxlength，validateMax 128。
