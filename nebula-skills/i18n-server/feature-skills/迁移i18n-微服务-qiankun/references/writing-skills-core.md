# writing-skills-core

本文件为 `迁移i18n-微服务-qiankun` 的长说明下沉页，用于解释为什么这个子skill要按当前方式组织，而不是把全部内容堆进主 `SKILL.md`。

## 核心约束

- 主 `SKILL.md` 只保留触发条件、核心流程、硬约束与 few-shot 选择原则。
- `template/` 负责给人看真实 before/after 或 mvp/snapshot。
- `assets/` 负责给 agent 看 frontmatter 模板、few-shot 入口和输出检查清单。
- `evals/evals.json` 负责 should-trigger / should-not-trigger 的最小验证基线。

## few-shot 选择原则

- 先看主模板，理解这个功能最核心的实现闭环。
- 如果当前仓库和主模板差异明显，再进入 `assets/few-shot-example/` 选择更接近的变体。
- 不把某个仓库的局部细节误认为唯一做法，而是提炼功能边界与迁移动作。

## 何时补新的 few-shot

- 同一功能在另一仓库出现了新的稳定成功提交。
- 当前 few-shot 不能覆盖明显不同的模块结构或消费边界。
- agent 在相邻技能之间经常误选，需要更多可比对样例来收紧判断。
