---
name: 更新-页面接入OperationColumn
description: 当 OperationColumn 溢出套件已存在，目标表格仍使用 el-table-column + el-button 操作列时，按 template/before|after 替换为 OperationColumn + OpItem。
---

# 更新-页面接入OperationColumn

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **业务表操作列迁移**。

## 何时使用

- 已存在 `OpItem.vue`、`OperationCellOverflow.vue`
- 目标表仍为 `<el-table-column label="操作">` + `el-button`

## 何时不要使用

- 组件不存在 → [`../新增-OperationColumn溢出套件/SKILL.md`](../新增-OperationColumn溢出套件/SKILL.md)
- 列表高度 / 分页 → `layout-fixedHeadTail-adaptiveMiddle`

## 规范样本

| 样本 | Before | After | 槽位 |
|------|--------|-------|------|
| **租户** | [`tenant/before`](../../template/before/src/views/tenant/components/TenantTable.vue) | [`tenant/after`](../../template/after/src/views/tenant/components/TenantTable.vue) | **6** |
| **用户** | [`user/before`](../../template/before/src/views/system/user/components/UserTable.vue) | [`user/after`](../../template/after/src/views/system/user/components/UserTable.vue) | **2** |
| **菜单主表** | — | [`menu-index fragment`](../../template/after/src/views/system/menu/menu-index-operation-column.fragment.vue) | **3** |
| **菜单弹窗** | — | [`dialog-tables fragment`](../../template/after/src/views/system/menu/dialog-tables-operation-column.fragment.vue) | 权限 **3**、API **4** |
| **角色** | — | [`role-list fragment`](../../template/after/src/views/system/role/role-list-operation-column.fragment.vue) | **3** |

Few-shot：[`tenant-table-replace.md`](../../assets/few-shot-example/tenant-table-replace.md)、[`user-table-replace.md`](../../assets/few-shot-example/user-table-replace.md)、[`menu-table-replace.md`](../../assets/few-shot-example/menu-table-replace.md)、[`role-table-replace.md`](../../assets/few-shot-example/role-table-replace.md)

槽位语义：[`slot-semantics.md`](../../references/slot-semantics.md)

## RED：迁移前核对

1. 操作列写死 `width`
2. `el-button` + `v-hasPerm`
3. `v-if` 在按钮上 → 迁到 `OpItem`
4. `OperationColumn`、`OpItem` import

## GREEN：替换步骤

### 1. import

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

### 2. 列壳（用户表示例）

```vue
<OperationColumn
  label="操作"
  fixed="right"
  :list-data-length="data.length"
  :inline-visible-count="2"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" perm="sys:user:edit" @click="emit('edit', row)" />
    <!-- 其余 OpItem，v-if 保留 -->
  </template>
</OperationColumn>
```

- 删除列 `width` 魔法数
- **勿**传 `probe-data-rows`
- **用户表多 `v-if` / status 切换**：组件 `tblProbeFp`（含 `status`、`showResendActivation`）与 `OperationCellOverflow` 行内签名会在启用↔停用时自动重探针并重切分；**勿**手写 refresh、假探针行或只靠改 `list-data-length`。见 [`column-width-probe.md` §触发重探针](../../references/column-width-probe.md#触发重探针)

### 3. 按钮 → OpItem

| Before | After |
|--------|-------|
| `v-hasPerm` on el-button | `perm` on OpItem |
| 内联 `div.i-svg:*` | `icon-class="i-svg:*"` |
| `v-if` on button | `v-if` on OpItem |

### 4. 槽位数（`inline-visible-count`）

参数为**槽位总数**（含「更多」占 1 槽），见 [`slot-semantics.md`](../../references/slot-semantics.md)。

| 页面 | 推荐值 | 预期 |
|------|--------|------|
| UserTable | **2** | 1 行内 + 更多 |
| TenantTable | **6** | 6 操作全行内 |
| 菜单主表 | **3** | 树表多分支 |
| Permission 弹窗 | **3** | 3 个 OpItem |
| Api 弹窗 | **4** | 2 个 OpItem 时常全行内 |
| RoleListTable | **3** | 2 个 OpItem 时常全行内 |

以 [`template/after/`](../../template/after/) 与 apex_dev 对应页为准，勿自创槽位。

### 5. 禁止项

- `probe-data-rows`、`PROBE_ROWS`、手写 `MenuType` 探针表

## REFACTOR

| 场景 | 处理 |
|------|------|
| 操作少 | `calcOpStrip` 折叠后可能无「更多」 |
| 非标准按钮 | 拆为 OpItem |

## 验收清单

1. 槽位语义与产品一致（对照 after 样本）
2. `perm` / `v-if` 行为不变
3. **用户表**：`status` 变更后行内/「更多」重切分（`tblProbeFp` + 行内签名；见 [`column-width-probe.md`](../../references/column-width-probe.md#触发重探针)）
4. 列宽稳定；异步 `:data` 后重探针
5. linter 无新增错误

## 使用示例

```text
租户表 6 个操作要全行内，请按 after/tenant TenantTable 设 inline-visible-count=6。
```

## 延伸阅读

- [`../../references/column-width-probe.md`](../../references/column-width-probe.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
