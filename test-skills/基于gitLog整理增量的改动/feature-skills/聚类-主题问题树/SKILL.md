---
name: 聚类-主题问题树
description: 主题键=问题根；THEME_GROUPS 子问题；禁止域名 mega。
---

# Feature：聚类主题问题树

## 何时使用

- `build_excel.py` 内 `build_problem_tree`
- 用户反馈「问题太宽/宽成域名」时查本 feature

## 何时不要使用

- 试图用域名标签当问题根（反例见 before/RED-baseline）

## 配置

- `configs/nebula-huiyan.theme-rules.json` — clusterRules 顺序敏感
- `configs/nebula-huiyan.theme-groups.json` — 仅 route-auth / secret-input 拆子问题

## 规则

见 `references/theme-cluster-rules.md`

## 反例

`assets/few-shot-example/nebula-0707-0807/before/RED-baseline.md`（14 域名级问题根）

## 实现

`scripts/build_excel.py` → `cluster_key()`、`build_problem_tree()`

## 验收（Nebula 0707-0807）

29 问题根、4 子问题 — 由 `verify_output.py` 断言

## 失败模式

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 问题根标题=租户管理 | 禁止 mega 合并 | 读 theme-cluster-rules |
| 子问题过多 | 仅 THEME_GROUPS 两组拆 | 其余直接 问题→提交 |

## 不要做什么

- 禁止 `mega[域名标签]` 合并问题根
- 禁止按域名前缀建 P001 级问题
