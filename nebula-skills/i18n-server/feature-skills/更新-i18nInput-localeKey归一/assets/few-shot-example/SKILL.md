---
name: 更新-i18nInput-localeKey归一 few-shot 入口
description: 当需要在主模板之外，为「更新-i18nInput-localeKey归一」选择更贴近当前仓库形态的 few-shot 时使用。
---

# 更新-i18nInput-localeKey归一 few-shot 入口

## 选择原则

- 告警 FormDialog（首字段或多字段）→ `告警配置-locale归一`
- 菜单 FormDialog（nameI18n + 树选择 + wire 校验）→ `菜单树-表单-locale归一`

## 场景与文件

| 场景 | 路径 |
|------|------|
| 告警配置-locale归一 | `告警配置-locale归一/template/after/src/views/system/alarmConfig/components/AlarmFormDialog.vue` |
| 菜单树-表单-locale归一 | `菜单树-表单-locale归一/template/after/src/views/system/menu/components/MenuFormDialog.vue` |
