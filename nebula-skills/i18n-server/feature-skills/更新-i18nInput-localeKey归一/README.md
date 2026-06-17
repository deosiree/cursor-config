# 更新-i18nInput-localeKey归一

I18nInput 组件升级后，将已有表单 parse/stringify 从 `zh_CN` 手写转换迁移到 `normalizeI18nLocaleCode` 体系。

## 历史来源（apex_dev）

| 提交 | 说明 |
|------|------|
| `2b106736` | I18nInput 默认 key、`I18nDialog` 接口语言列表 |
| `7fd591de` | `utils/i18n.ts` 归一化函数 + AlarmFormDialog |
| （后续） | MenuFormDialog 菜单名对齐 |

## 模板

- `template/before` — 旧 toInput/toWire 片段
- `template/after` — normalize 片段
- `assets/few-shot-example/` — 告警与菜单完整样例
