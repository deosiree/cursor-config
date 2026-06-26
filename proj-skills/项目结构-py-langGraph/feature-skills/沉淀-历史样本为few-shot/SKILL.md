---
name: 沉淀-历史样本为few-shot
description: 从真实 Agent 项目回填 assets/few-shot-example。Use when few-shot、terminology-agent 金样、REFACTOR 阶段。
---

# 沉淀-历史样本为few-shot

## 何时使用

- REFACTOR 阶段，项目结构已稳定
- 新增第二个 graph 域后，补充多图 few-shot

## 回填清单

| 文件 | 来源 |
|------|------|
| `project-tree.txt` | `app/` 目录树 |
| `graph-<workflow>-README.md` | `app/graph/<workflow>/README.md` |
| `services-<domain>-tree.txt` | `app/services/<domain>/` 树 |

## 禁止

- 虚构目录树
- 复制未落地的计划结构

## 输出契约

- 更新 `assets/few-shot-example/<repo>/`
