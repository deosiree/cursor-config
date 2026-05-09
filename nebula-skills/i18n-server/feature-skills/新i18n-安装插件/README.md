# 新i18n-安装插件

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

安装并对齐 vue-i18n、抽词等依赖，为新方案 runtime 和抽取链路打基础。

## 何时使用

- 仓库尚未具备新 i18n 插件和依赖，或依赖版本需要向统一方案对齐。

## 来源版本

- 主模板来源：`microfb` `aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`，侧重点：microfb 安装插件
- Few-shot 来源：
- `microfb-aca321d`：仓库 `microfb`，提交 `aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`，侧重点：microfb 安装插件
- `apex_dev-ec8710f`：仓库 `apex_dev`，提交 `ec8710f166b3ebf08bf14e93181266c9edbee27a`，侧重点：Apex 安装插件

## 模板与 few-shot

- 更新型 skill，主模板使用 `template/before` 与 `template/after`。
- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原本功能的成功实现
- 能区分主模板与其他 few-shot 变体
- 不再依赖伪造的 before/after 内容

## 使用示例

```text
这个仓库还没装新 i18n 相关依赖，先帮我对齐插件和抽词基础设施。
```

```text
我已经确定当前第一步是安装新 i18n 插件，不需要你比较其他功能节点。
```
