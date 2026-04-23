---
name: microfb-symbol-locator
description: 为拓扑与文档节点提供源码级符号定位（文件、函数、变量、读写点）。Use when 需要把抽象描述落到可追溯的源码证据。
---

# microfb-symbol-locator

## When to Use

- 任何文档需要“符号定位”章节。
- 需要把流程图中的节点映射到源码实体。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../template/microfb/流程图符号定位表.md`
- `../../template/microfb/状态链路/`
- `../../template/microfb/说明文档/`

约束：

- 禁止输出“仅概念映射”，必须与锚点文档命名和模块粒度对齐。

## Instructions

1. 针对每个节点至少输出：
   - 文件路径（必填）
   - 关键函数/变量名（至少 1 个）
   - 关键读写点/调用点（至少 1 个）
2. 优先定位这些核心模块：
   - 路由与守卫
   - 菜单存储与路由生成
   - 子应用注册与 props 同步
   - 登录登出与会话清理
3. 当节点无法直接定位时，必须标注：
   - `未定位原因`
   - `建议补证路径`
4. 输出用于文档插入的标准片段，不要仅输出搜索结果清单。

## Output Contract

- 输出 `symbolMapping[]`，每项结构：
  - `topic`
  - `module`
  - `filePath`
  - `symbols[]`
  - `readWritePoints[]`
  - `notes`

