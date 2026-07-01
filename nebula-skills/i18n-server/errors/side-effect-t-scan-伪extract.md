# side-effect `t()` 扫描伪 extract 与纯 TS 常量定义点

## 症状三联

1. 英文 locale 下，部分按钮/列头仍显示**中文 key 原文**（如「新增子项」）
2. 同组其他文案已英文化（说明消费点 `$t()` 正常、locale 里部分 key 已存在）
3. `pnpm run extract:i18n` 对该 key **新增 0**

## 根因

`vue-i18n-kit-sy` 的 extractor **只收集** `t("…")` / `$t("…")` / `trans("…")` 且**第一个参数为字符串字面量**（`StringLiteral`）。

以下写法**均不会被抽取**：

| 写法 | 为何无效 |
|------|----------|
| `label: "新增子项"` | 普通对象属性，不在 t/trans 调用内 |
| `t(MENU_ROW_ACTION_LABEL.addChild)` | 参数是变量引用（MemberExpression） |
| `buildTableColumns(){ t("菜单名称"); return [{ label: "菜单名称" }] }` | side-effect 字面量 t 只扫到「菜单名称」，但 return 里 label 仍是纯字符串；且 `t(CONST.xxx)` 完全扫不到 |
| `$t(action.label)`（模板消费点） | 参数是运行时变量，不是定义点 |

## 禁止模式

```ts
// 无效：以为 side-effect t() 能帮 extract 扫描常量里的 key
function buildMenuRowActionLabels(): void {
  t(MENU_ROW_ACTION_LABEL.addChild);
}
buildMenuRowActionLabels();

export const MENU_ROW_ACTION_LABEL = {
  addChild: "新增子项",
} as const;
```

```ts
// 无效：standalone t 与 label 纯字符串并存
const buildTableColumns = () => {
  t("菜单名称");
  return [{ prop: "menuName", label: "菜单名称" }];
};
```

## 正确模式

**定义点**用 `trans("字面量")`，**消费点**继续 `$t(var)` / `t(var)`：

```ts
import { trans } from "vue-i18n-kit-sy/runtime";

export const MENU_ROW_ACTION_LABEL = {
  addChild: trans("新增子项"),
} as const;
```

```vue
<OpItem :label="$t(action.label)" />
```

正例参考：

- apex_dev `tenant-table-columns.ts`（列头常量）
- apex_dev `menu-row-actions.ts`、`menu-table-columns.ts`（行操作 / 列头）
- few-shot `apex_dev-menu-row-actions`

## 修复步骤

1. 定义点改为 `trans("…")`，删除 side-effect `buildXxxLabels()` hack
2. `pnpm run extract:i18n`（应新增缺失 key 到 zh_CN / en_US）
3. 手动补 `en_US.json` 英文值（extract 对 en_US 默认写空字符串）
4. 英文 locale 下验证 UI

## 路由边界

| 情况 | 应进入 |
|------|--------|
| extract 新增 0 + 定义点在 TS 常量且无 trans 字面量 | `新i18n-编译宏外的定义点包trans+消费点包t` |
| locale 已有 key 但 en_US value 为空 | `新i18n-补充翻译json` |
| 定义点已在别处有 `t("字面量")` 且 extract 已写入，仅缺翻译 | `新i18n-补充翻译json` |

## legacy 边界：form-validation MSG

`form-validation.ts` 中 `MSG.xxx = "用户名不能为空"` 纯字符串 + `requiredRule(t, MSG.xxx)` 消费，是 microfb 历史提交快照：

- 运行时翻译正常（消费点 `t(MSG.xxx)`）
- extract **扫不到** MSG 内 key（`t(MSG.xxx)` 参数非字面量）
- 新代码优先 `fail(trans("…"))` 路径，见 `新i18n-纯ts中用i18n.global.t`；不要复制 MSG 纯字符串模式到新模块
