---
name: microfb-source-extract
description: 从 microfb 源码与模板文档抽取事实证据，生成可用于写作的结构化素材。Use when 需要避免文档脱离源码、减少主观猜测。
---

# microfb-source-extract

## When to Use

- 文档生成前需要先收集事实证据。
- 模板副本内容较多，需要快速分主题抽取。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../template/microfb/README.md`
- `../../template/microfb/状态链路/`
- `../../template/microfb/说明文档/`

约束：

- 所有事实必须可回溯到上述锚点或源码文件，禁止无锚点推断。

## Instructions

1. 默认优先读取：
   - `template/microfb/README.md`
   - `template/microfb/状态链路/**/*.md`
   - `template/microfb/说明文档/**/*.md`
2. 抽取内容时按主题输出：
   - 架构拓扑事实
   - 运行时链路事实
   - 状态驱动事实
   - 用户操作事实
3. 对每条事实附带来源路径，禁止“无来源断言”。
4. 如果模板与源码冲突，标记冲突并建议以源码为准。

## Output Contract

- 输出 `evidenceBundle`：
  - `topicFacts`
  - `sourcePaths`
  - `conflicts`
  - `resolutionHints`

