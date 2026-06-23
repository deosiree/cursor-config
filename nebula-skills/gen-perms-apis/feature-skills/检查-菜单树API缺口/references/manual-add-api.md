# 新需求新增 API 时，如何手动补菜单树

适用：apex_dev 改了页面/网关，租户管理员配了 perm 仍 403；或缺口检查脚本报 P0。

## 1. 先反查：这个调用到底走哪条 API

从**用户能点的操作**出发，沿三类链路追到最终 URL（见 `[[../../references/api-backtrace-rules.md]]`）：

```
页面/弹窗/组合式函数
  → XxxGateway.method(...)
    → src/api/... 中的 buildSeccenterV2Url("resource", "action")
      → 业务路径：/seccenter/v2/resource/action
```

非 seccenter 示例：

- 设备：`/devmgr/device/...`（`DeviceAPI` / `DeviceGateway`）
- 项目：`/dbres/project/...`（`ProjectGateway`）

**归一化规则**：去掉 `forward/`、`direct/` 前缀，菜单树里写业务路径，例如 `/seccenter/v2/role/create`，不要写 `/forward/seccenter/v2/role/create`。

## 2. 决定挂到哪个 perm（最关键）

| 场景 | 挂哪里 | 判断依据 |
|------|--------|----------|
| 点「新增」提交整条链路 | `sys:xxx:add` | `v-hasPerm="'sys:xxx:add'"` 的按钮 + 提交函数里**所有** follow-up API |
| 点「编辑」保存 | `sys:xxx:edit` | 同上，含弹窗内多 Tab 的保存 API |
| 仅打开列表/搜索 | `sys:xxx:query` | 进页、`getPage`、筛选项、并行拉配置/下拉 |
| 独立子操作（删除、导入等） | 对应 `delete` / `import` 等 | 该按钮的 `v-hasPerm` |
| 无 `v-hasPerm` 但随 query 触发 | `sys:xxx:query` | 如 `getPage` 并行 `ConfigV2API.detail` |
| 个人中心 / 登录白名单 | **不挂菜单 perm** | 走后端 API 白名单，不纳入本检查 |

**提交链路规则（易漏）**：一个按钮点下去若串行调多个 API，**全部**要挂在该按钮的 perm 下，不能只挂第一个。

示例（角色新增）：

- `role/create`
- `role/assignMenuPermissions`
- `role/assignDevices`
- `menu/tree`（打开弹窗预加载）

## 3. 在菜单树 YAML 里补 API

编辑 [`docs/menu/菜单树_0623_platform.yaml`](F:/Documents/Repertory/Sieyuan/nebula/docs/menu/菜单树_0623_platform.yaml)（或增量补丁文件）：

1. 找到目标 **page** 的 `route_path`（如 `/Apex/system/role`）
2. 找到对应 **function** 节点的 `perm`（如 `sys:role:add`）
3. 在 `apis:` 下追加一项：

```yaml
apis:
  - api_url: /seccenter/v2/role/create
    api_method: POST
    description: 创建角色 [ready]
```

- `api_method`：与 swagger / `*.api.ts` 一致，seccenter v2 多为 `POST`
- `description`：优先抄 `docs/api/seccenter.swagger.json` 的 summary/description，可加 `[ready]`
- **不要**再写 `/api/v2/*` 旧路径

若**尚无 function 节点**（新操作级 perm）：

1. 在 page 的 `children` 下新增 `type: function` 节点
2. 设 `perm`、`name`、`sort_order`、`status: enabled`
3. 再挂 `apis`

若 perm 在源码中**完全未使用**（无 `v-hasPerm`、无门控）：要么删菜单项，要么先改源码再接 perm，不要只挂 API。

## 4. 导入前验证

平台租户在「菜单管理」：

1. 导出当前树作备份
2. `dry_run: true` 导入预览（`POST /seccenter/v2/menu/project/import`）
3. 确认无误后 `dry_run: false` 正式导入

## 5. 用脚本复检

```bash
node feature-skills/检查-菜单树API缺口/scripts/check-menu-api-gap.node.js \
  --repo F:/Documents/Repertory/Sieyuan/nebula/apex_dev \
  --menu F:/Documents/Repertory/Sieyuan/nebula/docs/menu/菜单树_0623_platform.yaml \
  --scope default \
  --out F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/菜单树API缺口检查_<date>.md
```

- exit `0`：范围内无 P0
- 报告里 `待扩展 gateway 映射`：脚本未收录的 Gateway 调用，**不一定**是遗漏（可能是纯前端工具或未启用功能）

若新 API 反复报 P0 但 GATEWAY 已在用：在 `scripts/check-menu-api-gap.node.js` 的 `GATEWAY_API_MAP` 补一行，并更新 `[[cross-perm-patterns.md]]`。

## 6. 运行时验证（推荐）

给测试角色只勾目标 perm → 用普通租户账号走一遍操作 → 不应 403。

菜单管理 8 场景 E2E 见 `[[../菜单管理功能项依赖链验证/SKILL.md]]`。

## 检查清单（每次新需求）

- [ ] 从 views 追到 gateway→api 最终 URL
- [ ] 确认 `v-hasPerm` 归属 perm
- [ ] 提交链路里**所有** API 都写入该 perm 的 `apis`
- [ ] 删除无用 `/api/v2/*`、disabled 且无引用的 function
- [ ] 跑 `check-menu-api-gap.node.js`，P0=0
- [ ] dry_run 导入 + 测试账号实测
