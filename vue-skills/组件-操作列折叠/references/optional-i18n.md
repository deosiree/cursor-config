# 可选依赖：i18n（非本 skill 主责）

## 职责边界

本 skill 只改 **操作列结构**（`OperationColumn` / `OpItem` / 列宽 / 溢出）。  
**不**负责：locale 迁移、批量 `$t()`、i18n 插件安装或词条整理。

若发现项目本来就在做 i18n，可 **顺带** 检查「更多」词条；否则 **不添加** 任何 i18n 文件或改动。

## 落地前检查（新增套件步骤 2 子项）

```text
1. 仓库是否已接入 vue-i18n（如 main.ts 有 createI18n、页面普遍用 $t/useI18n）？
   - 否 → 跳过 locale；不复制 template/mvp/src/i18n/
   - 是 → 继续 2
2. OperationColumn 是否使用 t("更多")（见 template/mvp/.../index.vue）？
   - 是且 locale 已有「更多」键 → 无需改动
   - 是且 locale 无「更多」→ 仅在现有 locale 文件补 1 条（不扩 scope）
3. 业务表 OpItem 的 label：保持迁移前写法（硬编码或 $t），勿统一改 i18n
```

## 与 template/mvp 的关系

| 路径 | 是否必拷 |
|------|----------|
| `src/components/OperationColumn/*` | **是** |
| `src/directive/permission/index.ts`（checkHasPerm） | **是**（若项目有权限指令） |
| `src/i18n/locales/*.json` | **否**（仅当步骤 1–2 判定需要时参考补键） |

`template/mvp/src/i18n/` 仅为 **可选** 补「更多」键时的参照，不是本 skill 的必选交付物。

## 反模式（职责越权）

- 借操作列迁移顺带把用户表/租户表全文案改 `$t()`
- 未接 i18n 的项目强行复制整份 `zh_CN.json` / `en_US.json`
- 把「i18n 迁移」写进本 skill 的 GREEN 主流程

## 未接 i18n 且组件依赖 `t("更多")`

`OperationColumn` 实现使用 `useI18n()` 时，宿主需 **至少** 具备 vue-i18n 运行时（很多 nebula 项目已具备）。  
若宿主完全无 i18n：不在本 skill 内展开 i18n 方案设计 → 单独走 `i18n-server` 或项目架构决策；本 skill 仅完成操作列替换。
