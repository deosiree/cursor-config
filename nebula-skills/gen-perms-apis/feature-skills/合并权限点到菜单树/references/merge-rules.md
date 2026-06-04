# 菜单树合并规则

> 完整规范见父级 `[[../../../references/menu-yaml-spec.md]]`。

## 合并策略

| 场景 | 处理 |
|------|------|
| 补丁 page 在已有树中不存在 | 追加到对应父级 children |
| 补丁 page 已存在（同 route_path） | 只追加其下新增的 function，不重复创建 page |
| 补丁 function 同 `code` 在已有 page 下已存在 | 跳过（不重复创建） |
| 补丁 function 同 `code` 不存在 | 追加到该 page 的 children |

## 合并验证

1. 所有节点（page 和 function）的 `id` 不为 0
2. 所有节点的 `parent_id` 不为 `null`，且指向真实存在的父节点 ID
3. 无重复 `code`
4. hidden page 的 `is_visible: false` 已保留
5. 层级关系与已有树一致
6. 已有树中未涉及的节点完整保留

> **parent_id 验证是重点**：`parent_id: null` 不触发后端报错，导入成功但节点静默不显示。合并时必须逐一检查每个新增节点的 `parent_id`。

## 输出格式

```yaml
# 合并摘要
# 新增 page: 2（状态管理、个人中心）
# 新增 function: 5
# 跳过重复: 0
# 保留已有: 全部

menu_tree:
  - name: 管理中心
    children:
      - name: 首页
        route_path: /Apex/dashboard
        children:
          - name: 查看首页
            code: sys:dashboard:view
            type: function
            id: 12345
            parent_id: <首页 page 的 id>
      # ... 其他已有节点完整保留
  - name: 状态管理       # ← 新增
    route_path: /Apex/_state
    is_visible: false
    children: [...]
```
