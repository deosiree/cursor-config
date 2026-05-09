# 写skill 运行说明

## 作用
这份文档承接 `write-skill` 的执行性说明：什么时候升级为 agent、什么时候拆 intention / feature、Darwin 怎么接、人工门禁怎么停。

如果你只是想理解套件定位、结构职责和长期约束，优先看 `[[../README.md]]`。

## 何时升级为 agent skill
满足以下任一条件时，默认应把旧 skill 升级为 agent 套件：
- 已经存在多个真正独立的子能力
- 主 skill 同时承担现状分析、策略判断、功能执行和质量评估
- 需要在“意图判断”和“功能落地”之间反复切换
- 需要接入 Darwin 式质量闭环

## 何时继续拆成 intention / feature 两层
如果一个套件同时需要：
- 分析
- 策略
- 迁移判断
- 编排
- 真实功能执行

则优先采用：
- `intention-skills/`
- `feature-skills/`

如果某一层只是“多包一层目录”，却不承担独立判断职责，则应删除。

## Darwin 接入策略
### 阶段 A：桥接期
优先检查当前工作区是否存在：
- `./.cursor/darwin-skill`

若存在：
- 直接桥接外部 Darwin 套件
- `写skill` 不先复制它，只在流程中调用它的规则与资产

若不存在：
1. 请求人类介入，提供 Darwin skill
2. 若人类仍无法提供，再退化到 `写skill` 内部简化闭环

### 阶段 B：内嵌期
当桥接模式稳定后，再把当前 Darwin 套件整体并入：
- `[[../feature-skills/darwin质量评估与迭代]]`

内嵌时至少保留：
- `template/`
- `references/`
- `evals/`
- 必要的 few-shot 与检查清单

## 推荐工作流
1. `RED`
   - 先看失败基线
2. `GREEN-STRUCTURE`
   - 先补齐父级、intention、feature 节点的最小套件结构
3. `GREEN-CONTENT`
   - 再补齐 template、assets、references、evals 与 few-shot
4. `REFINE-MARKDOWN`
   - 统一进入 Markdown 结构收尾
5. `DARWIN`
   - 做结构评估、受控试跑、baseline 对比
6. `REFACTOR`
   - 根据评分与试跑结果继续拆层、改名、补模板与 few-shot

## 人工门禁
以下事实缺失时，不应直接展开整套总流程：
- `targetPath`
- `currentStructure`
- `goalState`
- 是否允许引入 Darwin 评估闭环

此时主 skill 应输出：
- `missingFacts`
- `humanGateReason`

## 与主入口的关系
主 `SKILL.md` 只保留高频路由与门禁入口，不再重复展开本文件内容。
