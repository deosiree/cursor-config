# apex_dev-menu-row-actions

## 来源

- 标识：`apex_dev-menu-row-actions`
- 仓库：`apex_dev` 菜单管理模块
- 适用变体：纯 TS 表格列头 / 行操作常量 + 模板 `$t(var)` 消费

## 症状

- 英文 locale 下 Actions 列「新增子项」仍显示中文
- 同列 Edit / Perm Config / Delete 已英文化
- `pnpm run extract:i18n` 对「新增子项」新增 0
- 消费点已有 `$t(action.label)`，易被误判为「只补 locale JSON」

## 根因

定义点使用纯中文字符串或 `t(CONST.xxx)` side-effect hack，extract 无法扫描。详见 `errors/side-effect-t-scan-伪extract.md`。

## 修复要点

1. `menu-row-actions.ts` / `menu-table-columns.ts` 定义点改 `trans("字面量")`
2. 删除 `buildMenuRowActionLabels()` 与 `buildMenuTableColumns` 内 standalone `t()` 行
3. 消费点 `$t(action.label)` / `$t(MENU_TABLE_COLUMN_LABEL.xxx)` 不变
4. `pnpm run extract:i18n` + 手填 `en_US.json`（见 `after/en_US.snippet.json`）

## 与 tenant 模块对照

`tenant-table-columns.ts` 已是正例（定义点 `trans()`），菜单模块应对齐同一模式。

## 模板类型

- `before/`：修复前（side-effect hack + 纯字符串）
- `after/`：修复后（trans 定义点）

## 与 i18nInput skill 的关系

I18nInput 读侧/缓存投影 skill 的 snapshot 仅展示 wire/投影链路；table 列头 i18n 正例以本 few-shot 为准，不要复制 snapshot 里旧的 side-effect 扫描写法。
