# 写skill 输出检查清单

## 父级 agent

- [ ] 主 `SKILL.md` 只负责分类、路由、人工门禁与质量闭环入口
- [ ] 主 `SKILL.md` 没有重新塞入命名细则、模板细则和 few-shot 细节
- [ ] 输出契约至少包含 `skillTaskClassification` 与 `qualityGatePlan`
- [ ] 已对照 `[[../references/write-skill-callback-guardrails.md]]` 做最低规范自检
- [ ] 主 `SKILL.md` 保留 `RED`、`GREEN`、`REFACTOR`
- [ ] 主 `SKILL.md` 与 `README.md` 都保留真实使用示例

## 分层结构

- [ ] 已判断当前是否需要升级为父级 agent 套件
- [ ] 若同时存在意图判断与功能落地，已拆成 `intention-skills/` 与 `feature-skills/`
- [ ] 不承担判断职责的中间层已删除或上提
- [ ] 每个 intention / feature 节点都已补成最小完整套件，而不是只有 `README.md` / `SKILL.md`
- [ ] 每个 intention / feature 节点的主 `SKILL.md` 都能直接读到任务、输入、输出、边界、示例
- [ ] 每个 intention / feature 节点的 `README.md` 都不是只有标题和一句作用说明

## 命名与路由

- [ ] 名称优先表达功能与作用，不使用 `commit-*`、`feature-*`
- [ ] 中文名称可读，且适合作为长期套件节点名
- [ ] 路由优先按“缺什么能力”判断，而不是按提交顺序判断

## 模板与 few-shot

- [ ] 已判断模板类型是 `before/after` 还是 `mvp/snapshot`
- [ ] 若引用历史版本，few-shot 来自真实历史事实
- [ ] 若多个案例对应同一功能名，已作为一个 skill 下的多个独立 few-shot 组织
- [ ] 每个子skill 自己都有本地 few-shot，不只依赖顶层 few-shot 索引
- [ ] 除 `模板类型判定` 外，单一模型节点没有再包 `template/update-skill` 或 `template/add-skill`
- [ ] `template/after` 不是只有说明文字的空壳，而是可复用的真实成品样本
- [ ] 除 `主文档反空心化验收` 自身外，`template/before` 不是空壳，而是错误态、失败产物或真实历史版本片段
- [ ] `template/<scenario>/` 既有实体样本，也有最小结构说明（任务输入、来源摘录、抽取步骤、验收理由）

## Markdown 收尾

- [ ] 已进入 `feature-skills/Markdown格式规范收尾`
- [ ] H1、空行、frontmatter 后首标题规则已统一
- [ ] Markdown 收尾完成前未提前进入 Darwin

## Darwin 质量闭环

- [ ] 已优先检查当前工作区 `./.cursor/darwin-skill`
- [ ] Darwin 缺失时存在“人工索取 -> 内部降级”的回退策略
- [ ] 至少设计了 baseline、试跑或优化迭代中的一种门禁
- [ ] 若需要复杂 keep / revert 决策，已下沉到编排型节点
- [ ] 只有在结构、内容、Markdown 都完成后才进入 Darwin

## 交付物

- [ ] 存在 `README.md`、`SKILL.md`、`template/`、`assets/`、`references/`、`evals/`
- [ ] `README.md` 解释了分层结构与 Darwin 接入策略
- [ ] `evals/evals.json` 覆盖 should-trigger 与 should-not-trigger
- [ ] 存在至少一份正式案例说明或 few-shot 索引
- [ ] “给人看”的摘要级示例没有全部下沉到 `assets/`
