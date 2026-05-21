# 布局-固定首尾，中间自适应

Vue 列表页通用布局 skill：**固定首尾**（顶部工具栏 + 底部分页），中间 `el-table` 通过 `ResizeObserver` 动态计算高度并在内部滚动。

命名说明：「首尾」表示顶部与底部均固定；目录名 `layout-fixedHeadTail-adaptiveMiddle` 中 Head/Tail 与中文「首/尾」对应。

## Frontmatter 模式

本套件采用 **本地中文模式**：

- `SKILL.md` 的 `name`、`description` 均为中文
- 目录名 `layout-fixedHeadTail-adaptiveMiddle` 仅作路径标识

## 解决什么问题

典型症状：

- 浏览器放大后分页被裁切
- 表格把整页撑长，只能滚页面、不能滚表格
- `max-height: 100%` 写在 `style` 里但不生效

根因通常是：**flex 高度链断裂** + **el-table 未绑定数值型 height prop**。

## 推荐落地顺序

1. **判定形态 A 或 B**（见 `SKILL.md` 布局形态判定表）
2. 按 `SKILL.md` RED 清单确认失败基线
3. 从页面根补齐 `height:100%` + `min-height:0`（形态 B 务必改 `index.vue`）
4. 头-中-尾 flex（A：单组件；B：父页 + 子 `*Table.vue`）
5. 引入 `useTableBodyHeight` 并绑定 `:height`
6. 按验收清单做缩放与 resize 回归

## 布局形态

| 形态 | 说明 | 文档 |
|------|------|------|
| A | 工具栏+表格+分页在同一列表组件 | `template/after/.../RoleListTable.vue` |
| B | 工具栏/分页在 `index.vue`，表格在子组件 | `references/split-layout-parent-child.md` |

Darwin 通用性评估见 `evals/darwin-generality-baseline.md`；试跑 prompt 见 `test-prompts.json`。

## 历史样本溯源

| 项 | 值 |
|----|-----|
| 仓库 | `apex_dev` |
| Commit（after） | `855cec2c68eea73a096a1ea949c38356aa73f95c` |
| 说明 | `fix(views): 角色管理：动态计算表格高度+固定首尾、中间自适应的弹性布局` |
| Before | `855cec2c^` → `template/before/` |
| After | `855cec2c` → `template/after/` |

涉及文件：

- `src/composables/useTableBodyHeight.ts`（新增）
- `src/composables/index.ts`（导出）
- `src/views/system/role/components/role/RoleListTable.vue`（核心）
- `src/views/system/role/components/role/index.vue`（编排层高度链）
- `src/views/system/role/index.vue`（`min-height: 0`）

## 目录说明

```text
layout-fixedHeadTail-adaptiveMiddle/
├── SKILL.md              # agent 主入口（RED/GREEN/REFACTOR）
├── README.md             # 维护者说明（本文件）
├── agents/openai.yaml    # Cursor 展示名与默认 prompt
├── template/before|after # 真实 commit 快照
├── assets/               # frontmatter 模板、验收清单、few-shot
├── references/           # 方法论与反模式
└── evals/                # 触发/误触发用例
```

## 关联 skill

- [`extract-shell`](../extract-shell/SKILL.md)：多 Tab + 壳组件已测算 `contentHeight` 时优先用壳
- [`vue3-component-slimming`](../vue3-component-slimming/SKILL.md)：大组件拆分，不改变本 skill 的布局职责

## 维护注意

- `template/` 样本来自真实 commit，更新样本时请同步改 `assets/few-shot-example` 中的 commit 说明
- 不要把长 diff 堆进 `SKILL.md`，保持主文档可执行、非空心
