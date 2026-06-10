# localStorage 键与默认列策略

## 已接入模块

| 模块 | storageKey | 默认显示列 | 默认隐藏列 |
|------|------------|------------|------------|
| 设备管理 | `device_manage_table_columns` | 设备名、ID、描述、型号、状态、创建时间 | 机器码、最后心跳、地区 |
| 租户管理 | `tenant_manage_table_columns` | 租户名、手机号、邮箱、状态、到期时间 | 联系人、创建时间 |
| 用户管理 | `user_manage_table_columns` | 用户名、角色、手机号、邮箱、状态 | 创建时间 |
| 角色管理 | `role_manage_table_columns` | 角色名称、角色描述、用户数量 | 无 |

选择列、操作列：`required: true`，不参与勾选，始终显示。

## initSelectedColumns 推荐模式

```ts
const initSelectedColumns = () => {
  const savedColumns = localStorage.getItem(STORAGE_KEY);
  const validProps = new Set(tableColumns.value.map((c) => c.prop));

  if (savedColumns) {
    try {
      const parsed = JSON.parse(savedColumns) as string[];
      const filtered = parsed.filter((prop) => validProps.has(prop));
      selectedColumns.value = filtered.length > 0 ? filtered : getDefaultSelectedColumns();
      return;
    } catch {
      // 非法缓存回退默认
    }
  }
  selectedColumns.value = getDefaultSelectedColumns();
};

const getDefaultSelectedColumns = () =>
  tableColumns.value
    .filter((c) => !c.required && c.visible !== false)
    .map((c) => c.prop);
```

新模块命名建议：`{module}_manage_table_columns`，全小写、下划线分隔。
