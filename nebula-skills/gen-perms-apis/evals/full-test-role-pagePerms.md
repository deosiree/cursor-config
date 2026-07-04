# full_test：角色管理 pagePerms 改码（2026-07-04）

> Darwin dim8 实测。Prompt：「继续实跑，改造角色管理、安全配置」

## 改前（RED）

| 问题 | 证据 |
|------|------|
| RoleListTable 5 处 v-hasPerm | toolbar + 搜索框 |
| OpItem 行级 `:perm` | 每行 edit/delete 二次 checkHasPerm |
| 双点 query 预算 | `index.vue` canQuery + `useRoleList.fetchData` checkHasPerm |
| 无 role.models.ts | 类型未集中 |
| handler 无入口守卫 | openRoleEditCreate/Edit、handleRoleFormSubmit |

## 改后（GREEN）

| 文件 | 改动 |
|------|------|
| `role.models.ts` | `RolePagePerms` 4 字段 + Pick 子类型 |
| `index.vue` | `shallowRef` 单 budget inline；`:perms` 下传 RoleIndex |
| `components/role/index.vue` | handler 守卫；useRoleList 读 pagePerms |
| `RoleListTable.vue` | `v-if="toolbarPerms/rowActionPerms"`；无 OpItem `:perm` |
| `useRoleList.ts` | 入参 canQuery/canDelete 回调，去掉内部 checkHasPerm |

## 验证

| 项 | 结果 |
|----|------|
| grep v-hasPerm / OpItem perm in role/ | ✅ 零残留（仅 index checkHasPerm 预算） |
| Linter | ✅ 无报错 |

## dim8 估分

8/10 — 主链贯通；RoleEditDialog 无 perm UI（纯表单，无需 :perms）

## 结论

full_test **PASS**
