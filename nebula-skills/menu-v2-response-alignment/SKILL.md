---
name: menu-v2-response-alignment
description: Use when generating nebula menu v2 response where hierarchy must be copied from a V1 sample exactly, and only per-node attributes are transformed to match a YAML attribute template.
---

# 目标

在 nebula 项目中生成菜单 V2 响应文件，遵循硬约束：

1. 层级关系只来自 V1 样例，必须 1:1 保持，不允许增删改节点或调整顺序。
2. 每个节点只改“属性集合与命名”。

## 输入参数（必须提供）

1. `output_dir`：输出目录。默认也是输出目录。
2. `structure_sample`：菜单样例（仅用于层级关系）。
3. `attribute_template`：属性模板（仅用于字段定义）。
4. `output_filename`（可选）：默认 `版本2的菜单管理响应.json`。

## 输出

1. `${output_dir}/${output_filename}`。

## 第一原则（必须执行）

1. 复制 V1 作为层级骨架。
2. 生成 V2 时必须复用该骨架，逐节点映射属性。
3. 任何“模板里有但 V1 没有的菜单节点”都禁止补入结果。

## 执行步骤

1. 读取 `structure_sample`，构建菜单树骨架。
2. 读取 `attribute_template`，提取字段规则（字段名、字段类型、命名风格、可选项）。
3. 对每个 V1 节点做属性重塑：
   - 替换为模板字段命名（如 `route_path`、`route_name`）
   - 删除模板未定义字段
   - 需要补充的模板字段给默认值（空串、空数组、布尔默认值）
4. 生成 YAML 文件并写入输出目录。

## 映射规则

1. 只允许“同节点属性转换”，禁止“跨节点搬运”。
2. 常见映射：
   - `menuName -> name`
   - `routePath -> route_path`
   - `routeName -> route_name`
3. `children` 递归处理，节点数量必须一致。
4. `type` 允许按约定转换，但不得影响层级：
   - 目录节点 -> `menu`
   - 页面节点 -> `page`
   - 功能节点 -> `function`

## 失败条件（任一命中即视为失败）

1. 输出包含模板未定义字段。
2. 节点数量与 V1 不一致。
3. 任意父子关系与 V1 不一致。
4. 节点顺序与 V1 不一致。

## 最小自检

1. 对比 V1 与结果的“节点路径列表”（例如 `管理中心/安全管理/用户管理`）必须完全一致。
2. 对比每个节点的 `children` 数量必须一致。
3. 对比输出字段集合必须是模板字段子集。
4. 确认输出路径为 `${output_dir}/${output_filename}`。

