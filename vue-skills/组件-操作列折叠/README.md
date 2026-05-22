# 组件-操作列折叠

Vue 表格 **操作列** skill：全局 `OperationColumn` + 声明式 `OpItem`，支持行内 N 个操作 + 「更多」溢出、列宽离屏探针估算。

## 解决什么问题

- 操作列 `width="200"` 写死，按钮增多后布局错乱
- 多个 `el-button` 横排，无「更多」折叠
- 权限、图标写法不统一（`v-hasPerm` + 内联 svg）

根因：缺少 **OpItem 声明式槽** + **OperationCellOverflow 切分** + **列宽协调器**。

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新增-OperationColumn溢出套件   → template/mvp
└── feature-skills/更新-页面接入OperationColumn     → template/before|after
```

推荐顺序：读 `SKILL.md` 路由 → 进入子 skill → 按验收清单回归。

## 目录说明

```text
组件-操作列折叠/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── feature-skills/
├── template/mvp|before|after/
├── assets/few-shot-example/
├── references/
└── evals/          # 质量评估归档，非 agent 执行依赖
```

## 维护注意

- 调整 OperationColumn 实现后：同步 [`template/mvp/src/components/OperationColumn/`](template/mvp/src/components/OperationColumn/) 与 [`references/column-width-probe.md`](references/column-width-probe.md)
- 调整页面接入形态后：同步 `template/before|after` 与对应 few-shot

## 溯源（推送后填写）

<!-- 合并推送远端后，可在此补充一次 commit 或 PR 链接，不作为 skill 路由依赖 -->

## 关联 skill

- [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)：列表高度链
- [`vue3-component-slimming`](../vue3-component-slimming/SKILL.md)：大组件拆分
