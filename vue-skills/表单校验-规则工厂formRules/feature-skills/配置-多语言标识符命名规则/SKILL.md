---
name: 配置-多语言标识符命名规则
description: 配置 nameIdentifier 风格：createNameValidator、normName、trimFieldOnBlur、createXxxNameRules。
---

# 配置-多语言标识符命名规则

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=nameIdentifier`。

messageKey：[`message-key-constraints.md`](../../references/message-key-constraints.md)。

## 何时使用

- 用户名、租户名、角色名、菜单名、权限名等
- 需要黑白名单、首字符、失焦 trim、提交规范化

## 模型

见 [`name-identifier-model.md`](../../references/name-identifier-model.md)。

## GREEN

### 1. rules 模块

1. 扩展 `NameFieldKind` 与 `NAME_MAX_LENGTH` 映射
2. 确认 `createNameValidator({ label, maxLength })` 内 `createRuleFail({ label, maxLength })`
3. 新增 `createXxxNameRules()`，内部 `label` 用 `fieldLabel` 字符串（**不**触发 i18n 任务）
4. 导出 `normName`、`trimFieldOnBlur`（名称/路径失焦 trim 共用）
5. 超长：`fail("{label}超过{maxLength}字")`；禁止 `"{label}不能超过 {maxLength} 个字符"` 类 key

### 2. 页面（通常再委派接入子 skill）

```vue
<el-input
  v-model="formData.name"
  maxlength="8"
  @blur="() => trimFieldOnBlur(formData, 'name', formRef)"
/>
```

```ts
// rules
name: createMenuNameRules(),
// submit
formData.name = normName(formData.name, NAME_MAX_LENGTH.menuName);
```

### 3. UI maxlength vs validate maxLength

两者可不同（如菜单名 8 / 128）；实施前已确认则按确认值写。

### 4. 测试

- 空、超长、非法字符、首字符非法、合法中英文
- 修复 [`known-issues.md`](../../references/known-issues.md) 中的 `normName` 链若仍存在

## 参考

- **样板片段**：[`formRules.name.fragment.ts`](../../template/sample-nebula/after/formRules.name.fragment.ts)
- 流程 few-shot：[`name-identifier-sample.md`](../../assets/few-shot-example/name-identifier-sample.md)

## 验收

- [ ] 校验在 blur/change 触发
- [ ] 提交走 `normName`
- [ ] 未改 locale
