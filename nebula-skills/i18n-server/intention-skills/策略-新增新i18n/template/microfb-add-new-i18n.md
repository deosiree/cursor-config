# microfb 退化后新增新i18n

## 事实来源

- `references/skill历史版本对应-沉淀为子skill及其few-shot.md`
- `microfb` 在旧 i18n 退化完成后的第二阶段

## 推荐顺序

1. `新i18n-安装插件`
2. `新i18n-样板代码`
3. `新i18n-基座-语言选择器`
4. `新i18n-补充翻译json`
5. `新i18n-Vue模板中使用$t()`
6. `新i18n-纯ts中用i18n.global.t`
7. `新i18n-ts或script setup中使用t(),可以包变量`
8. `新i18n-编译宏外的定义点包trans+消费点包t`
9. `新i18n-动态拼接：业务层回调t到函数定义`

## 为什么这样排

- 先补依赖和样板代码，确保 runtime 骨架存在
- 再补语言入口和 locale 资产，保证消费面有词条来源
- 再逐步收口模板、TS 与特殊边界

## 验证

- 新 runtime 正常初始化
- 语言切换可用
- locale JSON 可消费
- 模板层和 TS 层已不依赖旧链路
