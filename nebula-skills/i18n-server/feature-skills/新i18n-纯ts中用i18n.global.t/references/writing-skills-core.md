# writing-skills-core

本文件为 `新i18n-纯ts中用i18n.global.t` 的长说明下沉页，用于解释为什么这个子skill要按当前方式组织，而不是把全部内容堆进主 `SKILL.md`。

## 核心约束

- 主 `SKILL.md` 只保留触发条件、核心流程、硬约束与 few-shot 选择原则。
- `template/` 负责给人看真实 before/after。
- `assets/` 负责给 agent 看 frontmatter 模板、few-shot 入口和输出检查清单。
- `evals/evals.json` 负责 should-trigger / should-not-trigger 的最小验证基线。
- 本节点只讨论纯 TS 文件直接依赖全局 i18n 实例，不承接组件内 `useI18n().t` 场景。

## 为什么独立成新节点

- `request.ts`、`util.ts`、`helper.ts` 等文件没有 `setup()` 上下文，无法直接套用组件内 `t()` 的消费模式。
- 这类文件通常需要显式 `import i18n`，并在文件内建立局部 `t` 包装或直接调用 `i18n.global.t(...)`。
- 真实历史版本还可能顺带删除旧 helper；这与组件内文案收口的边界不同，容易误导路由。

## few-shot 选择原则

- 先看主模板，理解这个功能最核心的实现闭环。
- 如果当前仓库和主模板差异明显，再进入 `assets/few-shot-example/` 选择更接近的变体。
- 不把某个仓库的路径布局误认为唯一做法，而是提炼“纯 TS 全局实例消费”的功能边界。

## 何时补新的 few-shot

- 同一功能在另一仓库出现了新的稳定成功提交。
- 当前 few-shot 不能覆盖明显不同的纯 TS 文件角色，例如请求层、路由辅助层、表单工具层。
- agent 在本节点与组件侧 `t()` 节点之间经常误选，需要更多可比对样例来收紧判断。
