# Migration Checklist

## 迁移前

- [ ] 已确认仓库是否仍存在旧 `src/lang` 运行时
- [ ] 已确认是否存在语言切换入口
- [ ] 已确认是否允许升级到 `vue-i18n@11`
- [ ] 已列出模板文案、表单规则、`script setup` 文案、动态文本入口

## 主干步骤

- [ ] 已完成 `commit-01-static-deprecation`
- [ ] 已完成 `commit-02-plugin-install`
- [ ] 已完成 `commit-03-runtime-bootstrap`

## 按场景迁移

- [ ] 语言切换器已迁移到 `useLangStore` + `langOptions`
- [ ] locale JSON 已补足关键 key
- [ ] Vue template 文案已迁移到 `$t()`
- [ ] 表单规则翻译消费点已迁移到 rules 工厂或页面 runtime
- [ ] `script setup` / TS 文案已迁移到 `t()`
- [ ] 默认 props / 配置 key 已按需使用 `trans()` 标记
- [ ] 动态文本已回到业务层通过 `t()` 组装

## 收尾验收

- [ ] util 层不再直接输出最终展示文案
- [ ] `trans()` 只承担 key 标记职责
- [ ] 页面消费点承担最终显示翻译职责
- [ ] 关键迁移路径都能在本目录找到对应子 skill 与模板
