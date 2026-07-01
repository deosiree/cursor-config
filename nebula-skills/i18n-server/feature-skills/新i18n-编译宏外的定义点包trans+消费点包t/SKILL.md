---
name: 新i18n-编译宏外的定义点包trans+消费点包t
description: 当仓库命中“定义点不是模板内联文本，而是字段配置、规则中心等编译宏外结构，需要抽取脚本识别 key。”这一类问题时使用。
---

# 新i18n-编译宏外的定义点包trans+消费点包t

## 前置阅读

- `docs/前端国际化方案说明.md`
- `errors/side-effect-t-scan-伪extract.md`（纯 TS 常量 + extract 抽不到）

## RED

- 先确认当前问题是否真的属于“新i18n-编译宏外的定义点包trans+消费点包t”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## 🔴 CHECKPOINT · 路由门禁

改代码前**必须**确认：

- 症状是否匹配「extract 新增 0 + 定义点在 TS/常量且无 trans 字面量」（见 `errors/side-effect-t-scan-伪extract.md`）
- 若消费点无 `$t()` / `t()` → 先 `新i18n-Vue模板中使用$t()` 或 `新i18n-ts或script setup中使用t(),可以包变量`
- 若 extract 已扫到 key 仅 en_US 为空 → **停止**，路由 `新i18n-补充翻译json`
- 若需动态拼接文案 → **停止**，路由 `新i18n-动态拼接：业务层回调t到函数定义`

输出：`selectedFeatureSkill` = 本 skill 或排除理由；`definitionPointFiles` = 待改常量/配置文件列表。

### 易错清单（extract 抽不到 key）

**症状三联**

- 英文 locale 下部分按钮/列头仍显示中文 key 原文
- 同组其他文案已英文化（消费点 `$t()` 正常）
- `extract:i18n` 对该 key **新增 0**

**extract 静态规则**（`vue-i18n-kit-sy` extractor）

- 只收集 `t("…")` / `$t("…")` / `trans("…")` 且第一个参数为 **StringLiteral**
- 以下均**不会**被抽取：

| 写法 | 为何无效 |
|------|----------|
| `label: "新增子项"` | 纯对象字符串 |
| `t(MENU_ROW_ACTION_LABEL.addChild)` | 参数是 MemberExpression |
| `buildXxx(){ t("菜单名称"); return [{ label: "菜单名称" }] }` | side-effect 伪扫描 |
| `$t(action.label)` | 消费点变量，非定义点 |

**禁止模式**

- 不要用 side-effect `buildXxxLabels(){ t(CONST.xxx) }` 冒充 extract 扫描

**正确模式**

- 定义点：`trans("新增子项")`（参考 tenant / menu `*-table-columns.ts`、`menu-row-actions.ts`）
- 消费点：保持 `$t(action.label)` / `$t(CONST.menuName)` 不变

**路由边界**

- locale 有 key 但 en_US value 为空 → `新i18n-补充翻译json`
- 定义点仅在 TS 常量且无 trans 字面量 → **本 skill**

**legacy 边界：form-validation MSG**

- microfb 历史快照中 `MSG.xxx = "用户名不能为空"` + `requiredRule(t, MSG.xxx)` 运行时可用，但 extract 扫不到 MSG 内 key
- **不修改** microfb-462a31d 历史 after 文件；新代码优先 `fail(trans("…"))`，见 `新i18n-纯ts中用i18n.global.t`

## 失败模式与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| extract 新增 0，定义点纯字符串 | 定义点改 `trans("字面量")`，删 side-effect `t(CONST)` | 跑 extract + 手填 en_US |
| 英文 UI 仍中文，同组其他 key 已译 | 查 locale 是否有该 key；无则 extract 未扫到定义点 | 对照 `apex_dev-menu-row-actions` few-shot |
| 误以为消费点缺 `$t()` | 确认模板已 `$t(var)`；问题在定义点 | 读 `errors/side-effect-t-scan-伪extract.md` |
| formRules MSG 纯字符串 legacy | 运行时 `t(MSG.xxx)` 可用；新字段用 `fail(trans(...))` | 路由 `新i18n-纯ts中用i18n.global.t` |

## 不要做什么

- 不要仅用 side-effect `buildXxxLabels(){ t(CONST) }` 冒充 extract 扫描
- 不要见 extract 新增 0 就只手填 JSON、不改定义点
- 不要把 `trans()` 当最终展示文案（消费点仍需 `$t()` / `t()`）
- 不要篡改 microfb-462a31d 历史 after 快照里的 MSG 纯字符串
- 不要在 i18nInput snapshot 里复制 side-effect `t("菜单名称")` 列头 hack（已修正；正例见 few-shot）

## GREEN

- 功能目标：在编译宏外把定义点改成 trans 标记，再让消费点继续包 t。
- 主模板来源：`microfb` `462a31dbe13af101443bac1869b021803af6e945`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-462a31d`：仓库 `microfb`，提交 `462a31dbe13af101443bac1869b021803af6e945`，侧重点：formRules 与校验器消费点
- `microfb-c05f40d`：仓库 `microfb`，提交 `c05f40d07ec4f4092305df331bc94277ef2272da`，侧重点：组件字段定义点使用 trans
- `apex_dev-menu-row-actions`：apex_dev 菜单管理行操作 + 列头常量；纯 TS 定义点 trans + 模板 `$t(var)` 消费

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点

## 使用示例

```text
菜单管理 Actions 英文还显示「新增子项」，extract 新增 0，消费点已有 $t(action.label)。
```

```text
纯 TS 表格列头 / 行操作常量需要让 extract 识别 key，定义点该包 trans 还是 side-effect t？
```
