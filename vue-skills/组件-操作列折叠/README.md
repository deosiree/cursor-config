# 组件-操作列折叠

Vue 表格 **操作列** skill：`OperationColumn` + `OpItem`，**槽位语义**折叠 + `calcOpStrip` 列宽探针。

## 解决什么问题

- 操作列 `width` 魔法数、多 `el-button` 横排
- 需要「1 行内 + 更多」等可配置折叠（`inline-visible-count` = 槽位总数）
- 用户表 `status` 变更后操作列需自动重切分

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新增-OperationColumn溢出套件   → template/mvp（含 __tests__）
└── feature-skills/更新-页面接入OperationColumn     → template/before|after
```

## 真相源（维护）

与 **apex_dev** 对齐，参考 commit：`5cc2e143`（`refactor(component): OpCol: 更新inline-visible-count逻辑并改进溢出处理`）。

| 变更类型 | 同步目标 |
|----------|----------|
| 组件实现 | [`template/mvp/src/components/OperationColumn/`](template/mvp/src/components/OperationColumn/) |
| 槽位 / 探针文档 | [`references/slot-semantics.md`](references/slot-semantics.md)、[`references/column-width-probe.md`](references/column-width-probe.md) |
| 业务页样本 | [`template/after/`](template/after/)、[`assets/few-shot-example/`](assets/few-shot-example/) |

## 目录说明

```text
组件-操作列折叠/
├── SKILL.md
├── references/slot-semantics.md   # 槽位语义（必读）
├── template/mvp|before|after/
├── assets/few-shot-example/
└── evals/
```

## 关联 skill

- [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)
- [`vue3-component-slimming`](../vue3-component-slimming/SKILL.md)
