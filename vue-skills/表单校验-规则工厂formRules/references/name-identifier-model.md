# nameIdentifier 风格模型

## 语义

「多语言标识符」类名称：中英文字符 + 数字 + 下划线；禁止危险字符、不可见字符、路径遍历片段；首字符须为中文或拉丁字母。

## 校验链（trim 后）

1. 非空
2. 长度 ≤ `maxLength`（API 上限，可与 UI `maxlength` 不同）
3. 黑名单：不可见、`<>&"'`、`` ` ``、`\`、`..`
4. 白名单：`[\p{Han}\p{Latin}0-9_]+`
5. 首字符：`[\p{Han}\p{Latin}]`

## 配套能力

| 函数 | 时机 |
|------|------|
| `trimNameOnBlur` | 失焦写回 model 并 `validateField` |
| `normName` | 提交前：trim → 去黑名单 → NFC → `slice(0, maxLength)` |

## 工厂

```ts
createXxxNameRules() // 内部 createNameValidator({ label, maxLength })
```

`NameFieldKind` 映射各业务 `maxLength` 常量，避免魔法数散落。

## 常见分离

| 场景 | UI maxlength | validate maxLength |
|------|--------------|-------------------|
| 侧栏展示菜单名 | 8 | 128 |
| 权限名（非侧栏） | 无或 128 | 128 |

实施前若两值不同，**向用户确认**。

## 已知实现注意

见 [`known-issues.md`](known-issues.md)：`normName` 清洗链应持续使用 `cleaned` 变量。
