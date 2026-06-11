# 模板说明

## 结构

- `template/mvp`：I18nInput 组件 + 告警配置首字段最小闭环
- `template/snapshot`：菜单树 FormDialog 完整表单接线

## 文件清单

### mvp

| 路径 | 说明 |
|------|------|
| `src/components/I18nInput/index.vue` | I18nInput 入口 |
| `src/components/I18nInput/I18nDialog.vue` | 多语言弹窗 |
| `src/views/system/alarmConfig/components/AlarmFormDialog.vue` | 首字段 parse/stringify/submit |
| `src/utils/i18n.ts` | `resolveI18nJsonText` 基线 |

### snapshot

| 路径 | 说明 |
|------|------|
| `src/views/system/menu/components/MenuFormDialog.vue` | 树选择 + nameI18n + 重名校验 |

目录内均为可直接对照的源码文件，不含 patch 或版本元数据文件。

维护同步：用 `git show <ref>:<path>` 原始字节写盘（避免 PowerShell 管道改码），例如 Python `subprocess.check_output` + `write_bytes`。
