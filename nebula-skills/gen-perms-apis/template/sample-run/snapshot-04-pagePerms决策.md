# snapshot-04：pagePerms 静态预算决策

> supersede `[[snapshot-01-关键决策.md]]` **决策 4**（v-hasPerm 优先于 v-if）。  
> 证据：apex_dev 租户管理暂存区性能优化。

## 决策：复杂页默认用 pagePerms，而非 v-hasPerm 撒点

**时机**：租户页工具栏 + 10+ 行内 OpItem，鉴权调用达几十次/渲染周期。

**选项**：

| 选项 | 做法 | 问题 |
|------|------|------|
| A（旧） | v-hasPerm 优先 + actionPerms 字符串 | OpItem 每行二次鉴权；与 canQuery 重复 |
| B（旧） | 多个 canXxx computed + 父层 v-if | 仍与 v-hasPerm 双挂；子组件仍传字符串 |
| **C（新）** | **单一 xxxPagePerms computed + boolean props** | 每 perm 预算一次；子组件无二次鉴权 |

**决策**：C — pagePerms 静态预算

**理由**：

- `checkHasPerm` 在 RoutePermDict 下虽 O(1)，重复入口仍浪费且难维护
- OpItem `:perm` 设计适用于「单处操作」，不适用于「表格×多操作」
- 父页统一 boolean 源，模板/API/子组件一致

## 何时仍用 v-hasPerm

| 条件 | 可用 v-hasPerm |
|------|---------------|
| 整页 ≤2 个独立按钮 | 是 |
| 无表格行内 OpItem | 是 |
| 无子组件 `:perm` 二次鉴权 | 是 |
| 列表页 + 多行操作 | **否**，用 pagePerms |

## 与 snapshot-01 决策 4 的关系

决策 4 原文：「能用 v-hasPerm 不用 v-if，因为 v-if 需要新增 computed ref」。

**superseded**：复杂页恰恰需要**一个** computed（pagePerms），比撒十几个 v-hasPerm + 字符串 props **更少 ref、更少调用**。简单页例外仍可用 v-hasPerm。

## 对 skill 的影响

- `源码集中式权限改动`：模式 S 为列表页默认
- `centralized-diff-rules.md`：P0 = pagePerms，P1 = v-hasPerm（简单页）
- evals：删除「v-hasPerm 优先于 v-if」作为复杂页 expect

## 人工门禁

改码前问：

1. 是否有表格行内 OpItem？→ 是则必须 pagePerms + 禁止 `:perm`
2. 工具栏 perm 是否 >3？→ 是则禁止 v-hasPerm 撒点
3. 是否已有 canXxx 平行 computed？→ 合并进 xxxPagePerms
