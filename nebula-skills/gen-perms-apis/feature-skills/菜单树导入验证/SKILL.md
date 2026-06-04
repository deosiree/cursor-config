---
name: 菜单树导入验证
description: 将合并后的菜单树 YAML 通过 API 导入后端：先 dry_run 验证，确认无误后正式导入，并为角色模板勾选新增权限点。
---

# 菜单树导入验证

## RED

- 没有本 skill 时，最常见的问题是直接正式导入，出错后难以回滚
- 也容易忘记为角色模板勾选新增的权限点，导致即使导入成功也无法生效
- 常见失败：
  - 跳过 dry_run 直接正式导入，出错后面临脏数据
  - function 节点 ID 无效（0 或缺失）导致导入失败
  - **节点 `parent_id: null` 导致导入成功但节点不显示**（最隐蔽：不报错，静默丢失）
  - 导入成功但角色未分配新 perm，用户仍无权限

## 输入

- `菜单树 YAML 路径`：必填
- `导入 API 端点`：默认 `POST .../menu/project/import`
- `角色模板信息`：可选（用于自动勾选新 perm）

## GREEN

### 1. Dry Run 验证

```bash
POST {apiBase}/menu/project/import
Body: { menuTree: <菜单树内容>, dry_run: true }
```

检查：

- 响应是否成功（无 `[100000]未知错误`）
- 所有节点的 `id` 是否有效（不为 0）
- 所有节点的 `parent_id` 是否有效（不为 `null`，指向真实父节点）
- 无重复 `code`
- 层级关系是否正确

### 2. 常见错误排查

| 错误信息 | 根因 | 修复 |
|---------|------|------|
| `菜单 xxx 的 ID 无效: 0` | `patch_children_add` 中 function 缺少 `id` | 通过本地 API 查询/创建 function 获取 ID 后回填 |
| `[100000]未知错误` | 通用后端错误，通常是 ID 或字段格式问题 | 检查 dry_run 响应中的详细错误信息 |
| 导入成功但菜单不显示 | 角色未分配新 perm | 进入角色管理，勾选新增 perm |
| 导入成功但某节点不显示 | `parent_id: null`，节点失去父子关联 | 回填 `parent_id` 为父节点真实 ID |

### 3. 正式导入

```
1. dry_run 通过后
2. POST .../menu/project/import（dry_run: false）
3. 确认导入成功
```

### 4. 角色模板配置

导入成功后：

1. 进入角色管理
2. 为管理员/相关角色勾选新增的权限点
3. 保存角色配置
4. 相关人员重新登录或刷新权限

### 5. 回归验证

- 用 OpenCLI 验证：有 perm 的用户可访问，无 perm 的用户被拦截
- 验证 hidden page 不在菜单中显示
- 验证全局状态类 perm 不参与 RBAC（仅登记）

## 输出

- `dryRunResult`：dry_run 验证结果
- `importResult`：正式导入结果
- `roleConfigGuide`：角色模板配置步骤
- `regressionChecklist`：回归验证清单

## REFACTOR

- 若 dry_run 被跳过直接正式导入，补「dry_run 不通过不进入正式导入」的硬门禁
- 若 `parent_id` 检查被省略（只检查了 `id`），补「所有节点 parent_id 不为 null」的强制验证项
- 若角色模板配置步骤被遗忘，在导入成功后的输出中强制提醒
- 若回归验证只测正面不测负面，补「无 perm 用户必须被拦截」的负向用例

## 使用示例

```text
先把合并后的菜单树 dry_run 导入，确认无 ID 错误后再正式导入。
```

```text
菜单树导入成功了，但用户仍然看不到新权限，
帮我确认角色模板是否已勾选新 perm。
```
