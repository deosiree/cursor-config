# 新i18n-样板代码

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

建立新 i18n 样板代码和最小接入骨架，让仓库拥有统一的 runtime 入口与基础目录结构。

## 何时使用

- 仓库已经准备迁入新方案，但还没有统一的 i18n 样板代码和接入骨架。

## 来源版本

- 主模板来源：`microfb` `4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`，侧重点：microfb 新样板代码
- Few-shot 来源：
- `microfb-4d51b5b`：仓库 `microfb`，提交 `4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`，侧重点：microfb 新样板代码
- `apex_dev-390662a`：仓库 `apex_dev`，提交 `390662ac443ca838b519eca3adb0d40f2da2478a`，侧重点：Apex 样板代码与 opsdeck 对齐

## 模板与 few-shot

- 新增型 skill，主模板使用 `template/mvp` 与 `template/snapshot`。
- `template/mvp/`：来自主来源提交中新增出来的核心样板文件。
- `template/snapshot/`：来自主来源提交完成后的阶段快照。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原本功能的成功实现
- 能区分主模板与其他 few-shot 变体
- 不再依赖伪造的 before/after 内容

## 使用示例

```text
依赖已经装好了，但 `src/i18n` 骨架和统一入口还没建，帮我进入“新i18n-样板代码”。
```

```text
我现在只想补齐新 i18n 样板代码，不处理模板消费或 locale JSON。
```
