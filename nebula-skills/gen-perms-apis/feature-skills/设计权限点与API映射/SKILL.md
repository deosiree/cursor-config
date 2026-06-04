---
name: 设计权限点与API映射
description: 基于盘点文档，为每个模块输出权限设计方案：perm 粒度、命名、豁免清单、hidden page 收敛、跨模块归属与 perm→API 映射表。
---

# 设计权限点与API映射

## RED

- 没有本 skill 时，agent 容易在缺乏结构化决策框架的情况下自行裁量权限设计
- 常见失败：
  - 所有操作都拆成独立 perm，或相反全部合并为一个 page 级 perm
  - `direct/no-auth` 接口未被豁免
  - 跨模块 API 的 perm 挂在错误模块
  - 忘记 hidden page 收敛

## 输入

- `盘点文档`：必填（来自 `扫描源码权限点与API` 的输出）
- `关注模块`：可选
- `人工决策记录`：可选（权限粒度、豁免、归属的人工裁决）

## GREEN

### 1. 从盘点文档中提取设计域

从盘点文档的"未命中权限控制的权限点"章节提取所有需要设计的交互，建立待设计清单。

### 2. 按决策框架分类

参考 `[[../../references/perm-design-rules.md]]` 中的框架：

- **页面级守卫**：该页所有 API 共享一个 perm（如 `sys:dashboard:view`）
- **操作级拆分**：增删改查分别建 perm（如 `sys:tenant:add` / `sys:tenant:edit` / `sys:tenant:delete`）
- **豁免**：direct/no-auth 接口不建 perm
- **hidden page**：全局状态类 → 「状态管理」；非导航页 → 「个人中心」

### 3. 处理跨模块 API

- 原则：perm 挂在触发交互的页面模块
- 若已有独立模块 perm，可组合校验

### 4. 命名

- 格式：`<模块缩写>:<资源>:<操作>`
- 操作词：`query` / `add` / `edit` / `delete` / `import` / `export` / `view`

### 5. 输出 perm→API 映射表

每个 perm 下列出其管控的所有 API：

| 权限标识 | API Method | API URL | 契约来源 | 备注 |
|---------|-----------|---------|---------|------|
| `sys:dashboard:view` | POST | `/seccenter/v2/dashboard/query` | seccenter.swagger.json | — |

## 输出

- `designDocument`：权限设计方案（可合并到盘点文档或独立输出）
- `permToApiMapping`：完整映射表
- `exemptionList`：豁免清单
- `hiddenPagePlan`：hidden page 结构
- `pendingDecisions`：仍需人工裁决的项

## REFACTOR

- 若 perm 命名偏离 `<模块>:<资源>:<操作>` 约定，收紧命名规则引用 `[[../../references/perm-design-rules.md]]`
- 若 direct/no-auth 豁免被忽略，补「每个 API 必须先判定是否豁免再进入设计」的强制流程
- 若跨模块 API 挂在错误模块，补归属原则：「perm 挂在触发交互的页面模块，不挂在 API 所属模块」
- 若设计输出缺少「决策理由」列（只有映射表没有 why），补理由字段

## 使用示例

```text
基于盘点文档，设计首页、租户管理、安全配置的权限点与 API 映射。
```
