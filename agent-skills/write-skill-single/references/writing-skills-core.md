# writing-skills 核心原则整理

## 这份文档的作用
这不是对 `writing-skills` 的逐段翻译，而是为中文仓库提炼它最关键的工作方法，供 `write-skill-single` 在需要时按需引用。

## 1. 先看失败，再写 skill
`writing-skills` 的第一原则不是“先写出一个看起来完整的 skill”，而是先观察没有 skill 时 agent 会如何失败。

原因：
- 只有真实失败，才能暴露真正需要约束的点。
- 没看过失败，就容易写成泛泛的“最佳实践合集”。
- skill 的价值不在于写得长，而在于能纠正会重复发生的错误。

## 2. RED / GREEN / REFACTOR 仍然成立
### RED
- 先设计压力场景或真实任务。
- 观察 agent 在没有 skill 时的表现。
- 记录它遗漏了什么、误判了什么、用什么借口跳步。

### GREEN
- 只针对已观察到的问题写最小可用 skill。
- 不要一开始就为所有假想情况堆内容。

### REFACTOR
- 测试后如果还有新漏洞，就继续补。
- 新漏洞包括：误触发、不触发、输出格式漂移、跳步、自我合理化。

## 3. description 的本质是触发器
`description` 不是摘要，它首先决定 skill 会不会被加载。

写法要求：
- 重点写“何时使用”
- 尽量贴近用户意图，而不是内部实现细节
- 用中文时也要覆盖常见触发语义

## 4. rationalization / loophole / red flags
### rationalization
agent 在压力下会为跳过规则找借口，例如：
- “这个很简单，不需要先做测试”
- “我先写出来再补验证也一样”

### loophole
如果规则只写得很抽象，agent 会找到可钻的空子。

### red flags
把高风险信号列成清单，能帮助 agent 在执行中及时自检，例如：
- 还没看失败基线就开始写正文
- 只写结论，不写触发条件
- 没有 should-not-trigger 用例

## 5. 主文件只放高频规则
长篇理论、背景解释、外部参考不要全部堆进主 `SKILL.md`。

推荐做法：
- 主 `SKILL.md`：放每次都必须读的规则
- `README.md`：放维护者说明
- `template/`：放给人类看的完整示例、`before/after`、`mvp/snapshot`
- `assets/`：放给 agent 按需读取的 supporting files
- `references/`：放长说明与补充材料

这条可以视为主 `SKILL.md` 的 token 预算规则：
- 主文件只保留触发条件、核心流程、硬约束、关键决策表
- 大段示例和迁移清单下沉，不要堆进主文件正文

## 6. few-shot 应该给成品，不只给空模板
空模板只能告诉使用者“有哪些栏位”，不能展示“一个合格成品长什么样”。

因此更稳妥的做法是同时提供：
- 空模板
- 完整 few-shot 示例

如果任务本质是“代码/文档更新”，更优先提供 `before/after` 或 `mvp/snapshot`，而不是只给 `README-template.md` / `SKILL-template.md`。

## 7. 验证不只看输出，还要看触发
一个 skill 即使内容写得不错，如果触发不了，等于没有价值。

至少要验证两件事：
- should-trigger 情况下能否被稳定触发
- should-not-trigger 情况下会不会误触发

建议每条用例重复运行 3 次，避免偶然性误判。

## 8. frontmatter 可以有两种模式
对于中文仓库内部长期复用的 skill，可以优先采用“本地中文模式”：
- `name` 用中文
- `description` 用中文触发描述

如果目标是对外分享、规范校验或兼容通用 Agent Skills 生态，则切换到“对外兼容模式”：
- `name` 用英文 slug
- `description` 用规范兼容描述

关键不是二选一，而是要在交付物里明确声明本次采用的是哪一种模式。

## 9. `assets/` 不是官方唯一强制目录
本地 `writing-skills` 提供的是 supporting files 思路，而不是强制所有资源都必须放在 `assets/`。

因此更稳妥的口径是：
- 官方要求 `SKILL.md` 必需，并允许 supporting files
- `assets/` 是团队可选约定，适合存放 agent 侧素材
- `template/` 是团队可选约定，适合存放给人类看的前后示例和任务模板

## 10. 什么叫空心化
如果一个 skill 套件看起来目录齐全，但主 `README.md` 与主 `SKILL.md` 已经无法独立说明任务、输入、输出、边界和示例，就可以视为文档空心化。

典型信号：
- 主文档只剩“标题 + 一句作用说明”
- 使用示例只存在于 few-shot 或模板中
- 任务说明、输出字段、边界条件全部下沉到 `template/`、`assets/`、`references/` 或 `evals/`
- 不看 supporting files 就无法判断该 skill 到底做什么、何时触发、产出什么

## 11. 为什么空心化要作为一等验收项
callback 不是单纯检查“目录齐不齐”，而是要防止 skill 套件变成只有结构、没有可读正文的假完整状态。

如果不把空心化作为一等验收项，会出现两个后果：
- 主文档越来越短，但质量并没有变高，只是把有效内容藏起来了
- 后续 Darwin 或人工 review 只能从 supporting files 倒推规则，无法快速判断主套件是否合格

因此 callback 必须同时检查：
- 主文档是否保留摘要级可读内容
- supporting files 是否只是补充，而不是替代主文档

## 12. `before/after` 也不能空心
模板不是目录装饰。`before/after`、`mvp/snapshot` 也必须承载真实样本，而不是只留下 README 或 SKILL 解释“这里本来应该有什么”。

稳妥约定：
- `before` 默认应是错误态、失败产物或真实历史版本片段
- `after` 应是可复用的成品态样本
- 只有“主文档反空心化验收”这种专门处理空心问题态的节点，才允许它自身的 `before` 表现为空心案例
