---
name: 生成菜单树权限补丁
description: 基于权限设计方案，生成增量菜单树 YAML 补丁，包含新增 perm、hidden page 结构与 API 登记。强制要求 patch_children_add 中 function 节点必须先获取 ID 后回填。
---

# 生成菜单树权限补丁

## RED

- 没有本 skill 时，最常见的两类失败：
  1. function 节点没有 `id` → `patch_children_add` 无 `id` → 后端报「菜单 xxx 的 ID 无效: 0」→ 前端显示 `[100000]未知错误`
  2. 节点 `parent_id: null` → **不报错**，导入"成功"但节点失去父子关联 → 菜单中静默不显示，排查困难

## 输入

- `权限设计方案`：必填（来自 `设计权限点与API映射` 的输出）
- `已有菜单树路径`：可选（用于参考现有结构）
- `输出路径`：默认 `docs/menu/<日期>菜单树_权限补丁.yaml`

## GREEN

### 1. 确定补丁结构

补丁 YAML 使用增量模式，只包含新增和修改的节点，不输出完整菜单树。

```yaml
patch_children_add:
  - name: 状态管理
    route_path: /Apex/_state
    is_visible: false
    id: 10001
    parent_id: 1
    children:
      - name: 登录配置
        code: sys:state:loginSetting
        type: function
        apis:
          - /direct/seccenter/v2/auth/loginSetting
```

### 2. Page 节点结构

| 字段 | 说明 |
|------|------|
| `name` | 中文名称 |
| `route_path` | 前端路由路径（与 `RoutePermDict` 匹配口径一致） |
| `params` | 可选；多 page 同 path 时**必填**（见 `[[../../references/menu-yaml-spec.md]]`） |
| `is_visible` | 默认 `true`；hidden page 为 `false` |
| `children` | 子 function 节点（perm 必须挂在正确 page 子树下） |

### 2b. Hidden Page 结构

hidden page 是 `is_visible: false` 的 page 节点，字段同上。

### 3. Function 节点字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 功能名称 |
| `code` | 是 | 权限标识（如 `sys:dashboard:view`） |
| `type` | 是 | 固定 `function` |
| `id` | **是** | 必须通过本地 API 查询或创建后回填 |
| `parent_id` | **是** | 所属 page 的 ID（必须回填） |
| `apis` | 否 | 该功能项管控的 API 列表 |

### 4. ID 与 parent_id 回填（强制）

**两类回填均必须执行，缺一不可。**

在生成补丁 YAML 前：

**id 回填**：
1. 通过本地 API 查询已有 function/page 的 ID
2. 若不存在，通过创建 API 新建并获取返回的 ID
3. 将获取到的 ID 回填到每个节点的 `id` 字段
4. **严禁**提交 `id: 0` 或无 `id` 字段的节点

**parent_id 回填**：
1. 获取每个节点的父节点真实 ID（从已有菜单树提取或 API 查询）
2. 将父节点 ID 回填到每个节点的 `parent_id` 字段
3. **严禁**提交 `parent_id: null` 或无 `parent_id` 字段的节点

> 详细步骤见 `[[references/id-backfill-procedure.md]]`。

### 5. API 登记

每个 function 节点下的 `apis` 字段列出该权限点管控的所有 API URL：

- 使用业务路径（去掉 `direct`/`forward` 前缀）
- 若有多个 API，全部列出
- 豁免接口（direct/no-auth）不列入

## 输出

- `patchYaml`：增量菜单树权限补丁 YAML 文件
- `functionIdMap`：function 名称 → ID 的映射（用于审计）
- `apiRegistrationSummary`：API 登记摘要

## REFACTOR

- 若 ID 回填步骤被跳过，补「生成前必须执行 `GET /menu/function/query`」的强制前置检查
- 若 `parent_id` 回填被遗漏（只回填了 `id`），在输出验证中强制检查 `parent_id` 不为 `null`
- 若补丁格式偏离 `[[references/id-backfill-procedure.md]]` 中的规范，收紧模板引用
- 若补丁中 function 的 ID 来自猜测而非 API 返回，补「ID 来源必须可审计」要求

## 使用示例

```text
基于权限设计方案，生成菜单树权限补丁 YAML，
所有 function 节点必须先通过本地 API 获取 ID 后回填。
```
