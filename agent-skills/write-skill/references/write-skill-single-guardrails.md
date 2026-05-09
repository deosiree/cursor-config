# write-skill callback 约束基线

## 作用
这份文档把 `[[../../write-skill-single/SKILL.md]]` 中不可随意退化的规范抽出来，作为当前分层版 `write-skill` 的最低验收门槛。

`write-skill-single` 是规范基线，不是当前主套件的实现替代品。  
当前 `write-skill` 可以继续保留 intention / feature 分层、Darwin 桥接和人工门禁，但不能突破以下最低规范。

## 不可退化规则
- 主 `SKILL.md` 必须保留 `RED`、`GREEN`、`REFACTOR` 主线。
- 主 `SKILL.md` 与 `README.md` 都必须包含真实使用示例。
- 主 `SKILL.md` 必须写清楚何时使用、何时不要使用、输入契约、核心流程和验证要求。
- 子 skill 的主 `SKILL.md` / `README.md` 不能只剩标题和一句作用说明。
- 主文档必须能直接读到任务、输入、输出、边界、示例，不能完全依赖 `template/`、`assets/`、`references/`、`evals/`。
- `template/` 负责给人类看，`assets/` 负责给 agent 看，这个分工不能混淆。
- 大段长示例和 supporting files 可以下沉，但主文档必须保留摘要级说明。
- `evals/evals.json` 不只验证是否触发，还要能帮助识别误触发与边界。

## 空心化判定
出现以下任一情况，就视为文档空心化：
- `SKILL.md` 或 `README.md` 只有标题和一句定位说明。
- 主文档没有使用示例。
- 输出字段只出现在 `template/`、`evals/` 或 few-shot 中。
- 边界条件只藏在 few-shot / evals，不在主文档出现。
- 读完主文档后仍无法判断它和相邻节点的职责边界。

## 应用方式
- 修改主 `write-skill` 时，先对照本文件，再决定哪些内容可以下沉。
- 修改任一 intention / feature 节点时，主 `SKILL.md` 与 `README.md` 都要满足“最小自解释正文”。
- Darwin 受控试跑时，把本文件当作人工 review 的硬检查项，而不是可选建议。

## 与现有分层结构的关系
- callback 约束的是“最低文档质量”，不要求回退成单体旧版。
- 当前分层版的优势继续保留：
  - 意图判断与功能落地分层
  - Darwin 桥接与回退
  - feature 组合路由
- 当前分层版必须额外满足 callback 的最低可读性与可维护性要求。
