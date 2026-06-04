# ID 与 parent_id 回填流程

> 覆盖两类回填失败：
> - `id: 0` 或缺失 → 后端报 `[100000]未知错误`
> - `parent_id: null` 或缺失 → **不报错**，节点静默不显示
>
> 完整菜单 YAML 规范见父级 `[[../../../references/menu-yaml-spec.md]]`。

## 为什么必须回填

后端菜单导入 API 要求每个 function 节点有合法的 `id`。`patch_children_add` 中无 `id` 或 `id: 0` 会导致：

```
后端：菜单 xxx 的 ID 无效: 0
前端：[100000]未知错误
```

## 回填步骤

### 1. 查询已有 function

对补丁中每个 function，先通过本地 API 查询是否已存在同 `code` 的 function：

```
GET /menu/function/query?code=sys:dashboard:view
```

若返回已有记录 → 取 `id` 字段，直接回填。

### 2. 创建新 function

若查询结果为空，通过创建 API 新建：

```
POST /menu/function/create
Body: { code: "sys:dashboard:view", name: "查看首页", ... }
```

取返回的 `id` 字段，回填到补丁 YAML。

### 3. 回填到 YAML

```yaml
patch_children_add:
  - name: 首页
    children:
      - name: 查看首页
        code: sys:dashboard:view
        type: function
        id: 12345  # ← 必须回填真实 ID
        apis:
          - /seccenter/v2/dashboard/query
```

### 4. 验证

- 每个 function 节点 `id` 不为 0
- 每个 function 节点 `id` 不为空
- 补丁中所有 function 的 ID 均来自 API 返回

## parent_id 回填（强制）

> **这是「导入成功但菜单不显示」的根因。`parent_id: null` 不会触发后端报错，但节点失去父子关联，菜单中静默不显示。**

### 1. 获取父节点 ID

对补丁中每个 page 和 function：

- **顶层 page**：`parent_id` = 菜单树根节点 ID（从已有菜单树中提取或通过 API 查询）
- **子 page**：`parent_id` = 父 page 的 `id`
- **function**：`parent_id` = 所属 page 的 `id`

### 2. 回填到 YAML

```yaml
patch_children_add:
  - name: 状态管理
    route_path: /Apex/_state
    is_visible: false
    id: 10001          # ← page 自身 ID
    parent_id: 1       # ← 根节点 ID
    children:
      - name: 登录配置
        code: sys:state:loginSetting
        type: function
        id: 12345      # ← function 自身 ID
        parent_id: 10001  # ← 所属 page 的 ID
```

### 3. 验证

- 每个节点 `parent_id` 不为 `null`
- 每个节点 `parent_id` 不为空
- 每个节点 `parent_id` 指向真实存在的父节点 ID
- function 的 `parent_id` 等于所属 page 的 `id`

## 禁止

- ❌ 提交无 `id` 字段的 function
- ❌ 提交 `id: 0` 的 function
- ❌ 提交 `parent_id: null` 的节点
- ❌ 提交无 `parent_id` 字段的节点
- ❌ 使用自增 ID 或猜测 ID
