---
name: 更新-i18nInput-localeKey归一
description: 当 I18nInput 组件已升级为接口语言列表与 zh-CN 连字符 key，但表单仍用 toInputLocaleKey/toWireLocaleKey 或 locale.replace 导致主输入与弹窗 key 错位时使用。触发词：normalizeI18nLocaleCode、normalizeI18nDataLocaleKeys、localeKey归一、zh_CN与zh-CN重复、I18nInput重构对齐。
---

# 更新-i18nInput-localeKey归一

## 前置阅读

- `docs/前端国际化方案说明.md`
- `references/I18nInput-wire字段契约.md`
- 历史提交：`2b106736`（I18nInput 组件重构）、`7fd591de`（utils 归一化 + 告警表单）

## TL;DR

I18nInput 内存与 wire **统一连字符 locale key**（`zh-CN`）→ 表单用 `normalizeI18nLocaleCode` / `normalizeI18nDataLocaleKeys` 替代 `toInputLocaleKey` / `toWireLocaleKey` → 删除 `locale.replace("-", "_")` 手写转换。

## RED

- 确认 wire 已接 I18nInput；若首次接线 → `新增-i18nInput-表单字段`
- 确认 `src/components/I18nInput` 已为新版（默认 `zh-CN`、接口语言列表）；若仍是 `zh_CN` 旧组件 → 先对齐组件（见 `2b106736`）
- 对照 `template/before`（toInput/toWire）与 `template/after`（normalize）

## 🔴 CHECKPOINT · 路由门禁

改代码前**必须**输出：

- `selectedFeatureSkill` = 本 skill 或排除理由
- `symptom` = 主输入空白 / 弹窗与主输入不同步 / 提交 JSON 含重复 locale key
- `affectedForms[]` = 待改 FormDialog 路径

若用户描述的是「第一次给字段接 I18nInput」→ **停止**，改 `新增-i18nInput-表单字段`。

## GREEN

**功能目标**：表单 parse/stringify 与 I18nInput 弹窗共用同一 locale key 体系。

| 模板 | 说明 |
|------|------|
| before | `toInputLocaleKey` / `toWireLocaleKey` / `replace("-", "_")` |
| after | `normalizeI18nLocaleCode` + `normalizeI18nDataLocaleKeys` |
| few-shot | `告警配置-locale归一`、`菜单树-表单-locale归一` |

## 执行清单（按序）

1. **utils**：确认 `src/utils/i18n.ts` 已导出 `normalizeI18nLocaleCode`、`normalizeI18nDataLocaleKeys`（缺则从 `7fd591de` 补齐）
2. **import**：FormDialog 从 `@/utils/i18n` 引入上述两函数
3. **getCurrentLocaleKey**：改为 `() => normalizeI18nLocaleCode(locale.value)`
4. **parse**：object 分支保留原始 key → `return normalizeI18nDataLocaleKeys(parsed)`；JSON 字符串分支递归不变
5. **stringify**：`result[normalizeI18nLocaleCode(key)] = text`
6. **删除**：`toInputLocaleKey`、`toWireLocaleKey` 及所有 `replace("-", "_")` 手写 key 转换
7. **不变**：`xxxValue` computed、`v-model:i18n-data`、提交 `JSON.stringify` 调用点、读侧 `resolveI18nJsonText` 校验

## 失败模式与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 编辑旧菜单主输入为空 | `parse` 是否调 `normalizeI18nDataLocaleKeys` | 对照 `菜单树-表单-locale归一` few-shot |
| 弹窗有值、主输入无值 | `getCurrentLocaleKey` 是否仍用 `_` 格式 | grep `replace("-", "_")` 清残留 |
| 提交 JSON 同时含 `zh-CN` 与 `zh_CN` | `stringify` 是否用 `normalizeI18nLocaleCode` | 对照 `告警配置-locale归一` |
| I18nInput 弹窗语言列表为空 | 检查 `i18nAPI.getLanguageList` 与组件 `onMounted` | 先完成组件重构 `2b106736` |
| 读侧展示仍乱码 | 不在本 skill 修；路由 `新增-i18nInput-读侧展示` | 读侧 alias 由 `resolveI18nJsonText` 兜底 |

## 不要做什么（黑名单）

- 不要改侧栏/面包屑/缓存投影（属读侧或缓存 skill）
- 不要重新引入 `toInputLocaleKey` / `toWireLocaleKey`
- 不要把 `nameI18n` 合并进 `formData.name` 对象（除非用户明确要求重构校验模型）
- 不要在提交时强依赖 `I18nInput.getSubmitValue()`（与 AlarmFormDialog 一致，直接 stringify 内存对象）
- 不要改 vue-i18n locale 文件名（`zh_CN.json` 与 I18nInput wire key 是两套体系）

## 边界路由

| 症状 | 路由 |
|------|------|
| 首次接 I18nInput | `新增-i18nInput-表单字段` |
| 切换语言导航不更新 | `更新-i18nInput-缓存投影` |
| 列表/侧栏 JSON 乱码 | `新增-i18nInput-读侧展示` |

## 输出契约

每轮至少输出：

- `changedFiles[]`
- `removedHelpers[]`（如 `toInputLocaleKey`）
- `parseStringifyPattern`（是否已统一 normalize）
- `notInScope[]`（读侧/缓存/组件大改）

## REFACTOR

同仓库多个 FormDialog 共用同一 parse/stringify 模式；仅当 ≥3 处重复再抽 composable，单文件迁移保持内联。

## 使用示例

```text
MenuFormDialog 菜单名 I18nInput 与重构后的组件 key 不一致，要对齐 normalizeI18nLocaleCode。
```

```text
告警表单已改 locale 归一，菜单管理 FormDialog 也要同样调整 parse/stringify。
```
