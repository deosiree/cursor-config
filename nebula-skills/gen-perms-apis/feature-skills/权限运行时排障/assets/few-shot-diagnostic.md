# 权限运行时排障 — few-shot 示例

> 来自 2026-06-03 会话：isOwner 绕过失效 + Header computed 缓存

## 案例 1：租户所有者被权限拦截

### 现象

`admin@system.local` 登录后访问首页，显示「暂无权限查看首页」。

### 排查

```js
// OpenCLI 控制台
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.log('isOwner:', ui?.isOwner, typeof ui?.isOwner);
// 输出：isOwner: undefined undefined
```

### 根因

`sessionStorage.userInfo.isOwner` 不存在。旧 session 中 userInfo 未含此字段。

### 修复

完全退出重新登录（不要只刷新），`loginAfterAuth` 写入含 `isOwner: true` 的完整 userInfo。

### 验证

```js
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.log('isOwner:', ui?.isOwner, typeof ui?.isOwner);
// 输出：isOwner: true boolean
checkHasPerm('sys:dashboard:view');
// 输出：true
```

---

## 案例 2：Header「个人中心」登录后不显示

### 现象

登录后用户下拉中无「个人中心」，刷新页面后出现。

### 排查

```vue
<!-- NavbarActions.vue -->
const canViewProfile = computed(() => {
  // ❌ 只读 sessionStorage，不依赖 store ref
  // 登录前已计算为 false，登录后不重算
  return checkHasPerm("sys:profile:view");
});
```

### 根因

`computed` 只读 `sessionStorage`，未建立对 `userInfo` ref 的响应式依赖。`loginAfterAuth` 写入 userInfo 后，computed 缓存不失效。

### 修复

```vue
const canViewProfile = computed(() => {
  const info = userInfo.value;
  if (info?.id || info?.username) {
    void info.isOwner;      // 建立响应式依赖
    void info.permissions;  // 建立响应式依赖
  }
  return checkHasPerm("sys:profile:view");
});
```

### 验证

OpenCLI：登录后**不刷新**，下拉中出现「个人中心」。

---

## 案例 3：菜单导入成功但节点不显示

### 现象

菜单补丁导入成功（无报错），但新增的权限节点在菜单管理页面中不可见。

### 排查

检查合并后的菜单树 YAML 中每个新增节点：

```yaml
- name: 查看首页
  code: sys:dashboard:view
  type: function
  id: 12345
  parent_id: null  # ← 问题在这里
```

### 根因

`parent_id: null`。与 `id: 0` 不同，`parent_id: null` **不触发后端报错**，节点写入数据库但失去父子关联，在菜单树中静默不显示。

### 修复

1. 从已有菜单树中提取父 page 的 `id`
2. 将父 page 的 `id` 回填到所有子 function 的 `parent_id` 字段
3. 对于新增 page，`parent_id` 设为根节点 ID

```yaml
- name: 查看首页
  code: sys:dashboard:view
  type: function
  id: 12345
  parent_id: 100  # ← 父 page 的真实 ID
```

### 验证

重新导入后，检查菜单管理页面中新增节点是否可见。

---

## 案例 4：菜单导入报 [100000]未知错误

### 现象

dry_run 导入菜单补丁时报 `[100000]未知错误`。

### 排查

SSH 查看后端日志：`菜单 xxx 的 ID 无效: 0`

### 根因

`patch_children_add` 中 function 节点缺少 `id` 字段。

### 修复

1. `GET /menu/function/query?code=sys:dashboard:view` 查询已有 function
2. 若不存在，`POST /menu/function/create` 创建
3. 将返回的 `id` 回填到补丁 YAML
