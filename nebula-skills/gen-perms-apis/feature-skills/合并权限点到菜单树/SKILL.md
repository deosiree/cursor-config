---
name: 合并权限点到菜单树
description: 将增量权限补丁 YAML 与已有完整菜单树合并，保留现有结构、增量叠加新增节点，输出合并后的完整菜单树。
---

# 合并权限点到菜单树

## RED

- 没有本 skill 时，agent 容易直接替换整个菜单树，导致已有配置丢失
- 常见失败：
  - 覆盖已有菜单结构
  - 重复创建已存在的 function 节点
  - 合并后菜单树的层级关系错乱
  - **新增节点 `parent_id: null`**：不报错但菜单中静默不显示，是最隐蔽的失败

## 输入

- `补丁 YAML 路径`：必填（来自 `生成菜单树权限补丁` 的输出）
- `已有菜单树路径`：必填
- `输出路径`：默认 `docs/menu/<日期>菜单树_合并后.yaml`

## GREEN

### 1. 读取已有菜单树

- 解析已有完整菜单树的 YAML 结构
- 提取所有已有 page 节点、function 节点及其 `code`

### 2. 合并策略

| 场景 | 处理方式 |
|------|---------|
| 补丁中的 page 在已有树中不存在 | 追加到对应层级 |
| 补丁中的 page 已存在 | 只追加其下新增的 function 节点 |
| 补丁中的 function 在已有 page 下已存在（同 `code`） | 跳过，不重复创建 |
| 补丁中的 function 在已有 page 下不存在 | 追加到该 page 的 children |

### 3. 验证

- 所有节点（page 和 function）的 `id` 不为 0
- 所有节点的 `parent_id` 不为 `null`，且指向真实存在的父节点 ID
- 无重复 `code`
- 层级关系与已有菜单树一致
- hidden page 的 `is_visible: false` 已设置

## 输出

- `mergedMenuTree`：合并后的完整菜单树 YAML
- `mergeSummary`：合并摘要（新增 page 数、新增 function 数、跳过数）

## REFACTOR

- 若合并退化为全量替换已有树，收紧：「必须从补丁 YAML 出发做增量合并，不重新生成整棵树」
- 若 `parent_id` 验证被跳过，补强制检查：每个新增节点 `parent_id` 必须指向真实存在的父节点 ID
- 若合并摘要缺失，补输出模板引用 `[[template/merge-output.md]]`
- 若已有树中的节点被意外删除，补差异对比步骤

## 使用示例

```text
把 0601菜单树_权限补丁.yaml 合并到 0601菜单树_20260601084145.yaml，
保留现有结构，只追加新增的权限点和 hidden page。
```
