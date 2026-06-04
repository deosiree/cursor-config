# snapshot-01：关键决策节点（真实历史样本）

> 本文件沉淀自 2026-06-03 会话。供人类阅读和 agent few-shot 参考。
> 对应 write-skill 规范中的「真实历史样本型模板 — 写 snapshot」。

## 决策节点 1：个人中心权限策略

**时机**：Phase A 完成后，发现个人中心没有 v-hasPerm 但调用了 user/detail、updatePassword 等 API。

**选项**：
- A. 登录即可访问，不建 perm（API 走会话鉴权）
- B. 新增 1 个 page 级 perm `sys:profile:view`
- C. 按操作拆分多个 perm（查看/改密/改手机/上传头像）

**决策**：B — 1 个 perm + hidden page

**理由**：需要前端入口守卫，但不需要操作级拆分。

**对 skill 的影响**：意图 skill `策略-设计权限点` 必须在此类决策点停下来提问。

---

## 决策节点 2：租户管理跨模块 API 归属

**时机**：分析发现租户页调用了 `devmgr/device/activate` 和 `dbres/resource/bind`。

**选项**：
- A. 并入 `sys:tenant:edit`
- B. 新增独立 perm（`sys:tenant:bindDevice` / `sys:tenant:bindResource`）
- C. 复用 deviceManage 模块 perm，前端组合校验

**决策**：B — 新增独立 perm

**理由**：跨模块 API 操作独立性强，并入 edit 会导致权限粒度不一致。

**对 skill 的影响**：跨模块归属是高频决策点，`策略-设计权限点` 必须覆盖。

---

## 决策节点 3：loginSetting 豁免

**时机**：发现 `loginSetting` 被租户/用户/个人中心多处消费。

**源码证据**：
- `route-channel.ts`：`loginSetting` 在 `DIRECT_AUTH_ACTIONS` 中
- `auth.v2.api.ts`：`Authorization: no-auth`

**决策**：豁免 — 不建功能项 perm，收敛到 hidden page「状态管理」仅做登记。

**对 skill 的影响**：豁免判断依赖源码证据（direct 前缀 + no-auth），`扫描源码权限点与API` 必须在反查链路中识别。

---

## 决策节点 4：源码改动原则

**时机**：用户反馈 "最小化改动+集中式改动"。

**要点**：
- 父组件一层 `v-if` 替代子组件多处 `v-hasPerm`
- API 守卫在入口处一次 `checkHasPerm`
- 已有合理子级 perm 不强行上提

**后续细化**（本次会话）：能用 `v-hasPerm` 不用 `v-if`，因为 `v-if` 需要新增 computed ref，改动面更大。

**对 skill 的影响**：`源码集中式权限改动` 的优先级链必须是 v-hasPerm > v-if > props。

---

## 决策节点 5：菜单补丁 ID 回填

**时机**：OpenCLI 端到端测试时发现导入失败。

**错误**：`菜单 xxx 的 ID 无效: 0` → `[100000]未知错误`

**根因**：`patch_children_add` 中 function 节点没有 `id`。

**修复**：通过本地 API 查询/创建 function 获取 ID 后回填到补丁 YAML。

**对 skill 的影响**：`生成菜单树权限补丁` 必须强制要求 ID 回填，这是不可跳过的步骤。

---

## 决策节点 6：microfb vs apex 责任边界

**时机**：用户反馈 "下拉框直接权限判断是否显示个人中心即可"。

**发现**：下拉来自 microfb 基座 `NavbarActions`，不是 apex 子应用。

**决策**：基座负责 UI 显隐，子应用负责页面守卫。在 apex 中还原了重复的 NavbarActions 改动。

**后续 bug**：登录后「个人中心」不显示，刷新才出现。根因是 computed 缓存。

**修复**：computed 中添加 `void userInfo.value?.isOwner` 响应式依赖。

**对 skill 的影响**：
- `源码集中式权限改动` 必须明确 microfb vs apex 责任边界
- `权限运行时排障` 必须覆盖 computed 缓存问题
- `OpenCLI端到端验证` 必须验证登录后不刷新场景
