---
name: 新增-i18nInput-表单字段 few-shot 入口
description: 当需要在主模板之外，为「新增-i18nInput-表单字段」选择更贴近当前仓库形态的 few-shot 时使用。
---

# 新增-i18nInput-表单字段 few-shot 入口

## 选择原则

- 单表单首字段 → `告警配置-首字段` 或主 `template/mvp`
- 同表单扩展第二、三字段 → `告警配置-扩展多字段`
- 菜单树 FormDialog（含树选择与 wire 校验）→ `菜单树-表单` 或主 `template/snapshot`

## 场景与文件

| 场景 | 路径 |
|------|------|
| 告警配置-首字段 | `告警配置-首字段/template/mvp/src/views/system/alarmConfig/components/AlarmFormDialog.vue` |
| 告警配置-扩展多字段 | `告警配置-扩展多字段/template/mvp/src/views/system/alarmConfig/components/AlarmFormDialog.vue` |
| 菜单树-表单 | `菜单树-表单/template/snapshot/src/views/system/menu/components/MenuFormDialog.vue` |
