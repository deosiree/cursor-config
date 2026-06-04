# after-01：完整执行链路（真实历史样本）

> 本文件沉淀自 2026-06-03 会话。供人类阅读和 agent few-shot 参考。
> 对应 write-skill 规范中的「真实历史样本型模板 — 基于 GREEN 写 after」。

## 执行链路总览

```
用户需求
  → Phase A: 源码分析盘点（各模块 API 消费调研）
  → 人工决策点: 权限粒度 + 跨模块归属 + 豁免
  → Phase B: 权限点设计（perm 粒度 / 豁免 / hidden page）
  → Phase C: 菜单树 YAML 补丁生成
  → Phase D: 源码集中式改动（7 个模块）
  → Phase E: 文档输出（盘点 / 补丁 / 验证说明）
  → 人工执行: 菜单补丁导入（dry_run → 正式导入）
  → 人工反馈: NavbarActions 权限显隐 → 优化
  → Phase F: OpenCLI 端到端验证
  → Phase G: 权限运行时排障（isOwner 绕过失效）
  → Phase H: 修复 computed 缓存问题 → 再验证
```

## 各阶段产物

### Phase A：源码分析盘点

- 产出 7 份模块盘点文档（`docs/menu/模块盘点/`）
- 每个模块产出：已命中 perm + 未命中但调用 API 的操作

### Phase B：权限点设计

关键决策：
- 首页：1 个 page 级 perm `sys:dashboard:view`
- 个人中心：1 个 page 级 perm `sys:profile:view` + hidden page
- 安全配置：2 个 perm（`sys:securityConfig:edit` + `sys:sessionConfig:edit`）
- 租户管理：跨模块 API 建独立 perm（`sys:tenant:bindDevice` + `sys:tenant:bindResource`）
- loginSetting：豁免 + hidden page「状态管理」

### Phase C：菜单树 YAML 补丁

- `0601菜单树_权限补丁.yaml`：增量补丁
- 含 2 个 hidden page（状态管理、个人中心）
- 新增 function 节点含 `code` + `apis`

> **踩坑**：后续 OpenCLI 测试发现 `patch_children_add` 无 `id` → 后端报「菜单 xxx 的 ID 无效: 0」。
> 修复：通过本地 API 查询/创建 function 获取 ID 后回填。

### Phase D：源码集中式改动

| 模块 | 改动方式 |
|------|---------|
| 首页 | `loadDashboardData` 守卫 + 顶层 `v-if="canViewDashboard"` |
| 租户 | `index.vue` 集中 `canQuery/canAdd/...`；`TenantTable` 收 `actionPerms` |
| 个人中心 | `assertProfilePerm()` + 整页 `v-if` |
| 用户 | `toolbarPerms` 在 `index.vue`；`UserSearchBar` 用 props |
| 角色 | `fetchData` 增加 `sys:role:query` 守卫 |
| 安全配置 | `useSecurityConfigPage` 按 perm 分支 |
| 菜单 | 工具栏 `canQuery/canAdd/canImport/canExport` |

### Phase E：文档输出

- `权限点-API-配置方案.md`：总方案
- `0601菜单树_权限补丁.yaml`：增量补丁
- 7 份模块盘点
- `验证与导入说明.md`：dry_run、角色模板、回归清单

### Phase F-G：端到端验证与排障

- OpenCLI 验证 bypass 路径、Header 显隐、页面守卫
- 发现 isOwner 绕过失效根因：`sessionStorage.userInfo.isOwner` 未写入
- 发现 Header computed 缓存问题：登录后不重算
- 修复：computed 中添加 `void userInfo.value?.isOwner` 响应式依赖

## 对 skill 设计的启示

1. 全流程 8 个阶段，不能假设一次调用完成
2. 菜单补丁 ID 回填是高频踩坑点，必须写入 skill 强制规则
3. OpenCLI 验证不可或缺——代码审查无法发现运行时问题
4. microfb vs apex 责任边界必须明确（Header 显隐 vs 页面守卫）
5. computed 缓存问题是常见 bug，排障 skill 需要决策树
