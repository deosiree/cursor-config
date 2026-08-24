---
name: 标注-域名与主域
description: domain-dict 与 tag_domain 双轨标注；协作域不删行。
---

# Feature：标注域名与主域

## 何时使用

- `build_excel.py` 聚类前（脚本内自动调用）
- 跨项目改 `domain-dict` / `collaborators` 后

## 何时不要使用

- 单独跑标注而不 build（无独立 CLI；改 config 后重跑 build）

## 配置

- `configs/nebula-huiyan.domain-dict.json` — 域名字典 Sheet
- config 内 `defaultOwner`、`collaborators`

## 规则

见 `references/domain-tagging-rules.md`

## 实现

`scripts/build_excel.py` → `tag_domain()`

## 输出列

是否主域、域名标签、域名映射依据、域名主责人、我的角色

## 失败模式

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 协作人猜错 | 回 `分析-项目属性与harness` | AskQuestion |
| 全标「通用视图/表单」 | 补 theme-rules 正则 | 对照 subject 样本 |

## 不要做什么

- 不因「是否主域=否」删提交行
- 不把域名标签写入问题根标题
