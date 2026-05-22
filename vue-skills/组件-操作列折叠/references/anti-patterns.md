# 反模式

## 1. 操作列写死 width

```vue
<!-- 反模式 -->
<el-table-column :label="$t('操作')" fixed="right" width="200">
```

问题：按钮增多后挤版或留白过大。  
正解：`OperationColumn` + `OpItem`，去掉魔法 width，由组件估宽。

样本 before：`template/before/.../TenantTable.vue`。

## 2. 在溢出列内继续使用 el-button

```vue
<!-- 反模式 -->
<OperationColumn ...>
  <template #default="{ row }">
    <el-button v-hasPerm="..." @click="...">编辑</el-button>
  </template>
</OperationColumn>
```

问题：探针认 `OpItem` 的 `data-op-*`，`el-button` 不参与估宽与切分。  
正解：一律 `OpItem`。

## 3. 重复权限写法

```vue
<!-- 反模式 -->
<OpItem perm="sys:x:edit" v-hasPerm="'sys:x:edit'" />
```

正解：只保留 `perm`。

## 4. icon 内联 div

```vue
<!-- 反模式 -->
<el-button>
  <div class="i-svg:foo w-[12px] h-[12px]"></div>
  {{ $t('文案') }}
</el-button>
```

正解：`<OpItem icon-class="i-svg:foo" :label="$t('文案')" />`。

## 5. 未落地套件就改表

在无 `OpItem.vue` / `OperationCellOverflow.vue` 时直接改 `TenantTable` → 编译失败。  
正解：先 **新增** 子 skill，再 **更新** 子 skill。

## 6. 沿用旧版 OperationColumn

若 `index.vue` 仍含：

```vue
<div v-auto-width class="operation-buttons">
  <slot :row="row"></slot>
</div>
```

→ 走 **新增** 子 skill，从 `template/mvp/` 整体替换，而非只改业务页。

## 7. 漏同步 checkHasPerm

- 无 `checkHasPerm` 导出 → `OpItem` 权限失效

## 8. 借操作列迁移做 i18n（职责越权）

- 把用户表硬编码文案批量改 `$t()`，或复制整份 locale
- 项目未接 vue-i18n 却强行拷 `template/mvp/src/i18n/`

正解：见 [`optional-i18n.md`](optional-i18n.md)——仅当**已**用 i18n 且组件需要时，可顺带补「更多」一条。

## 9. （可选）已接 i18n 但缺「更多」键

- 溢出按钮文案 fallback 异常

仅在 optional-i18n 检查链通过后补键，不扩 scope。

## 10. 手写探针行或恢复 PROBE_ROWS

```ts
// 反模式：组件内或业务页
const PROBE_ROWS = [{}, { showResendActivation: true }];
// 反模式：业务页
:probe-rows="[{ type: MenuTypeEnum.DIRECTORY }, ...]"
```

问题：与真实 `:data` 脱节，换表要维护第二套 if-else；`inline≥2` 时易列宽裁切。  
正解：由 `inject(ElTable)` + `collectProbeRowsFromTableData` 从表数据取样。见 [`column-width-probe.md`](column-width-probe.md)。

## 11. 业务页传 probe-data-rows

```vue
<!-- 反模式：重复真相源 -->
<OperationColumn :probe-data-rows="data" :list-data-length="data.length" />
```

正解：只传 `list-data-length`；探针读表由组件内 inject 完成。

## 12. 误把异步空表当探针失败

- 控制台 `probeRowCount: 0` 且表数据随后才加载 → 属竞态，**不要**加假行或弹错补丁到业务页
- 确认 `:data` 与 `list-data-length` 同步；数据到达后应自动重探针
