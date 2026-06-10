# 组件-列设置

Vue 列表 **列显示/隐藏** skill：`ColumnFilter` + `buildTableColumns` + `visibleColumns` 动态列 + `localStorage`。

## 解决什么问题

- 列表列过多，用户需自定义显示/隐藏
- 列偏好需刷新后记忆
- 多模块（设备/租户/用户/角色）需统一接入模式

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新增-组件列设置   → template/mvp + snapshot
└── feature-skills/应用-列设置       → template/before|after
```

## 真相源（维护）

与 **apex_dev** 对齐：

| 类型 | 来源 | commit / 状态 |
|------|------|----------------|
| 组件 MVP | `ColumnFilter.vue` | `a5b3214` |
| 设备页 snapshot | `device/index.vue` 列设置片段 | 当前 HEAD |
| 租户/用户/角色 before | 业务页 | `git show HEAD:<path>` |
| 租户/用户/角色 after | 业务页 | 工作区成品（列设置接入后） |

| 变更类型 | 同步目标 |
|----------|----------|
| 组件实现 | [`template/mvp/src/components/ColumnFilter/`](template/mvp/src/components/ColumnFilter/) |
| 设备页片段 | [`template/snapshot/`](template/snapshot/) |
| 业务页样本 | [`template/before/`](template/before/)、[`template/after/`](template/after/) |

## 目录说明

```text
组件-列设置/
├── SKILL.md
├── references/          # 契约、页面形态、反模式
├── template/mvp|snapshot|before|after/
├── assets/few-shot-example/
├── test-prompts.json
└── evals/
```

## 关联 skill

- [`组件-操作列折叠`](../组件-操作列折叠/SKILL.md)
- [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)
