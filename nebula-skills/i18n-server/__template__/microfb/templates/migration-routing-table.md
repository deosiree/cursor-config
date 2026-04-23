# Migration Routing Table

| 仓库症状 / 迁移入口 | 先读哪个子 skill | 下一步 | 备注 |
| --- | --- | --- | --- |
| 仍有旧 `src/lang`、语言枚举、全局 route title 翻译 | `commit-01-static-deprecation` | `commit-02-plugin-install` | 先退化成静态单语言中间态 |
| 需要安装新 runtime 依赖 | `commit-02-plugin-install` | `commit-03-runtime-bootstrap` | 对齐 `vue-i18n@11` 与 `vue-i18n-kit-sy` |
| 需要建立 `src/i18n` 骨架、lang store、extract config | `commit-03-runtime-bootstrap` | `commit-04-lang-select-recovery` 或 `commit-05-locale-json-fill` | 基座完成后再处理消费点 |
| 需要恢复语言切换器 | `commit-04-lang-select-recovery` | `commit-05-locale-json-fill` | 依赖 `useLangStore` 与 `langOptions` |
| locale JSON 还缺 key | `commit-05-locale-json-fill` | `commit-06-vue-template-dollar-t` | 先补 key 再迁移模板 |
| Vue 模板里仍有静态文案 | `commit-06-vue-template-dollar-t` | `commit-07-form-rules-consumption-boundary` 或 `commit-08-script-setup-runtime-t` | 优先处理模板层 |
| 表单规则、校验消息仍硬编码 | `commit-07-form-rules-consumption-boundary` | `commit-08-script-setup-runtime-t` | 翻译消费点应在 rules 工厂运行时 |
| `script setup` / TS 中仍有硬编码通知或 computed 文案 | `commit-08-script-setup-runtime-t` | `commit-09-trans-key-marking-mvp` | 页面脚本负责 runtime `t()` |
| 默认 props 文案需要被抽词工具识别 | `commit-09-trans-key-marking-mvp` | `commit-10-dynamic-function-text-callback` | `trans()` 标记 key，消费点再 `t()` |
| MFA/OTP/倒计时等动态文本仍在 util 中拼接 | `commit-10-dynamic-function-text-callback` | `commit-11-foundation-cleanup` | 把动态翻译回推到业务层 |
| 需要最终收尾 util / 页面边界 | `commit-11-foundation-cleanup` | 结束 | 基座国际化收口 |
