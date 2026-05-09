# 写skill 核心规则

## 1. 主 skill 默认只做 agent
当一个 skill 套件同时拥有多个真正独立的子能力时，主 `SKILL.md` 应升级为父级 agent：
- 负责分类
- 负责路由
- 负责人工门禁
- 负责质量闭环入口

不要让主 skill 同时承载：
- 分析
- 策略
- 模板判定
- few-shot 组织
- Darwin 试跑细节

## 2. 何时拆成 intention / feature 两层
如果当前套件同时需要：
- 现状分析
- 策略判断
- 迁移编排
- 真实功能落地

则优先拆成：
- `intention-skills/`
- `feature-skills/`

## 3. 何时需要编排型节点
如果流程里存在以下任一复杂度：
- 多阶段判断
- 方案比较
- 质量门禁
- keep / revert 决策
- 外部 skill 桥接与回退

则不要继续挤在主 `SKILL.md`，而应新增编排型节点。

## 4. 命名规则
- 优先中文功能名
- 优先表达“它补什么能力”
- 不用 `commit-*`
- 不用 `feature-*`
- 不用仓库专属、但没有功能语义的中间层名称

## 5. 模板规则
- 新增型能力：优先 `mvp/snapshot`
- 更新型能力：优先 `before/after`
- 若使用历史版本示例，必须以真实历史事实为准，不允许伪造前后态

## 6. few-shot 规则
如果多个历史案例都在解决同一个功能名：
- 保留一个功能型 skill
- 每个历史案例都作为这个 skill 下的独立 few-shot

## 7. Darwin 质量闭环规则
先写出最小可用套件，不等于任务完成。

默认还要继续经历：
1. baseline
2. controlled trial
3. optimize
4. keep / revert

优先桥接工作区下的 `./.cursor/darwin-skill`；缺失时才人工索取，再退化到内部降级方案。

## 8. Markdown 收尾规则
`references/markdown-format-rules.md` 只是长说明，不应停留在被动参考。

当套件进入收尾阶段时，应显式进入：
- `[[../feature-skills/Markdown格式规范收尾/SKILL.md]]`

执行顺序固定为：
1. 结构补齐
2. 内容补齐
3. Markdown 收尾
4. Darwin 评估
