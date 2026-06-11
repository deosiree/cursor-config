---
name: 新增-i18nInput-表单字段
description: 当仓库命中“业务字段要从 plain string 改为 I18nInput 存库 JSON wire，需在表单 append 接线、parse/stringify、提交与编辑回填”时使用。触发词：I18nInput、JSON wire、parseI18nData、stringifyI18nData、表单多语言字段、告警描述国际化。
---

# 新增-i18nInput-表单字段

## 前置阅读

- `docs/前端国际化方案说明.md`
- `references/I18nInput-wire字段契约.md`（上级 `i18n-server/references/`）

## TL;DR

表单 append `I18nInput` → 内存 `I18nData`（`zh_CN`）→ 提交 `JSON.stringify` wire（`zh-CN`）→ 编辑 `parseI18nData` 回填。

## RED

- 先确认问题属于「表单 wire 接入」，不是读侧展示或缓存投影
- 先看 `template/mvp`；菜单树 FormDialog 看 `template/snapshot`
- 若 `src/components/I18nInput` 不存在，从 `template/mvp/src/components/I18nInput/` 复制

## 🔴 CHECKPOINT · 路由门禁

在改代码前**必须**输出：

- `selectedFeatureSkill` = 本 skill 或排除理由
- `wireFieldList` = 本轮要改的字段名（如 `name`、`description`）

若用户描述的是侧栏 JSON 乱码或切换语言导航不更新 → **停止**，改路由到读侧或缓存投影 skill。

## GREEN

**功能目标**：表单字段通过 I18nInput 编辑多语言，API 提交 JSON wire。

| 模板层 | 路径 | 场景 |
|--------|------|------|
| mvp | `template/mvp` | 告警首字段 + 组件 |
| snapshot | `template/snapshot` | 菜单 FormDialog |
| few-shot | `assets/few-shot-example/` | 扩展多字段 / 菜单树 |

## 执行清单（按序）

1. **组件**：确认 `I18nInput/index.vue` + `I18nDialog.vue`；缺失则从 mvp 复制
2. **表单三件套**：`I18nData` + `parseI18nData` / `stringifyI18nData`；`toInputLocaleKey` / `toWireLocaleKey`
3. **绑定**：`xxxValue` computed + `v-model:i18n-data` + `#append` + `I18nInput`
4. **提交**：payload 字段传 `JSON.stringify({ "zh-CN": "...", "en-US": "..." })`，禁止 plain string
5. **回填**：`parseI18nData(row.rawXxx ?? row.xxx)`
6. **校验**：重名规则读 wire：`resolveI18nJsonText(item.name, locale)`

## 失败模式与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 侧栏/表格显示 JSON 乱码 | 不在本 skill 修展示；路由 `新增-i18nInput-读侧展示` | 若切换语言仍不更新 → `更新-i18nInput-缓存投影` |
| 提交后后端仍是纯文本 | 检查 submit 是否 `stringifyI18nData`，非 `formData.xxx` 直传 | 对照 mvp `AlarmFormDialog` submit 段 |
| 编辑弹窗名称为空 | `parseI18nData` 是否读 `row.rawName ?? row.name` | 对照 snapshot `MenuFormDialog` open 逻辑 |
| 同表单加第二、三字段 | 复用 parse/stringify；参考 `告警配置-扩展多字段` few-shot | 禁止复制三套独立 parse 函数 |
| `I18nInput` 组件缺失 | 从 mvp 复制组件目录 | 禁止手写简化版弹窗 |

## 不要做什么（黑名单）

- 不要改侧栏/面包屑/列表 resolve（属读侧 skill）
- 不要改 `menu-repo` / `writeMenuCache` 投影（属缓存 skill）
- 不要在表单校验读 `menuName` 展示字段
- 不要把 `refreshMenuCacheProjection` 写进 `i18n.ts`
- 不要用 `$t()` 替代用户可编辑入库字段

## 边界路由

| 症状 | 路由 |
|------|------|
| 读侧 JSON 乱码 | `新增-i18nInput-读侧展示` |
| 切换语言壳层不更新 | `更新-i18nInput-缓存投影` |
| 静态 UI 文案 | `新i18n-Vue模板中使用$t()` |

## 输出契约

每轮至少输出：

- `changedFiles[]`
- `wireFields[]`（改了哪些字段的 wire）
- `submitPayloadShape`（示例 JSON 键名）
- `notInScope[]`（明确未改读侧/缓存）

## REFACTOR

同模块扩展字段只泛化 parse/stringify，不顺手做壳层 wrapper。

## 使用示例

```text
菜单名称要接 I18nInput，提交时存 JSON wire。
```

```text
告警描述、模板也要像名称一样多语言编辑。
```
