# Template Guide

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 所有模板都来自真实 git 历史，不允许把 before/after 写成同一份文件

## 主模板来源

- 主模板来源：`microfb` `6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`，侧重点：login-mfa 等动态拼接函数

## 主模板说明

- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。

## Few-shot 清单

- `microfb-6a3e495`：仓库 `microfb`，提交 `6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`，侧重点：动态 helper 与业务函数

- `apex_dev-fd02487`：仓库 `apex_dev`，提交 `fd02487fd927b3c35a02bea9ce3daac7a4228007`，侧重点：租户管理与动态规则函数
