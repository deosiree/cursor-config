# 新增-i18nInput-表单字段

本 skill 采用 add-skill 模型：`template/mvp` + `template/snapshot`。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再阅读 `../../references/I18nInput-wire字段契约.md`

## 功能

业务可编辑字段通过 I18nInput 接入 JSON wire：表单 append、parse/stringify、提交与编辑回填。

## 何时使用

- 字段要从 plain string 改为入库 JSON
- 需要 I18nInput 弹窗编辑多语言
- 不涉及侧栏/列表/缓存读展示

## 场景与文件清单

| 场景 | 模板层 | 关键文件 |
|------|--------|----------|
| 告警配置-首字段 | mvp | `src/components/I18nInput/*`、`src/views/system/alarmConfig/components/AlarmFormDialog.vue`、`src/utils/i18n.ts` |
| 菜单树-表单 | snapshot | `src/views/system/menu/components/MenuFormDialog.vue` |
| 告警配置-扩展多字段 | few-shot mvp | `AlarmFormDialog.vue`（description/template 扩展） |

## 模板说明

- `template/mvp/`：最小闭环（组件 + 单业务表单）
- `template/snapshot/`：菜单 FormDialog 完整表单接线
- `assets/few-shot-example/`：按场景命名的变体，目录内为源码树

## 完成态

- 表单可编辑、提交、回填 wire JSON
- 校验读 wire 字段，不依赖展示投影
- 未改动侧栏/缓存读链路
