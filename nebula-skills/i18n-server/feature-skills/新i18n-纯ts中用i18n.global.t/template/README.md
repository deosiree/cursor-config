# Template Guide

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 所有模板都来自真实 git 历史，不允许把 before/after 写成同一份文件

## 主模板来源

- 主模板来源：`opsdeck` `453b4aa790aef84c915ae2b5ec4535b4f842254f`，侧重点：纯 TS / `request.ts` 中直接 `import i18n` 并消费 `i18n.global.t(...)`

## 主模板说明

- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。

## Few-shot 清单

- `opsdeck-453b4aa`：仓库 `opsdeck`，提交 `453b4aa790aef84c915ae2b5ec4535b4f842254f`，侧重点：纯 TS 文件直接使用全局 i18n 实例
