# 生成菜单树权限补丁 — few-shot 示例

> 来自 2026-06-03 会话：`0601菜单树_权限补丁.yaml`

## 触发

```text
基于权限设计方案，生成菜单树权限补丁 YAML。
所有 function 先通过本地 API 获取 ID 后回填。
```

## 输入：权限设计方案（摘要）

- 首页：`sys:dashboard:view` → API: `/seccenter/v2/dashboard/query`
- 状态管理（hidden）：`sys:state:loginSetting` → API: `/direct/seccenter/v2/auth/loginSetting`
- 个人中心（hidden）：`sys:profile:view` → API: `/seccenter/v2/user/detail` 等

## 输出：补丁 YAML（片段）

```yaml
patch_children_add:
  - name: 状态管理
    route_path: /Apex/_state
    is_visible: false
    id: 20001
    parent_id: 1
    children:
      - name: 登录配置
        code: sys:state:loginSetting
        type: function
        id: 10001
        parent_id: 20001
        apis:
          - /direct/seccenter/v2/auth/loginSetting
  - name: 个人中心
    route_path: /Apex/profile
    is_visible: false
    id: 20002
    parent_id: 1
    children:
      - name: 查看个人中心
        code: sys:profile:view
        type: function
        id: 10002
        parent_id: 20002
        apis:
          - /seccenter/v2/user/detail
          - /seccenter/v2/user/updatePassword
```

## 踩坑记录

> **坑 1**：初次生成时 function 节点未带 `id` → dry_run 报「菜单 xxx 的 ID 无效: 0」。
> 修复：通过 `GET /menu/function/query?code=...` 查询已有 function，或通过 `POST /menu/function/create` 创建后获取 ID，回填到 YAML。

> **坑 2**：补丁 YAML 中 page 节点和 function 节点的 `parent_id: null` → 导入成功但节点在菜单中不显示。
> 修复：page 的 `parent_id` 设为根节点 ID（从已有菜单树提取），function 的 `parent_id` 设为所属 page 的 ID。
